import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  LearnerInstructorLink,
  LearnerInstructorLinkDocument,
} from "../../schemas/learner-instructor-link.schema";
import { Learner, LearnerDocument } from "../../schemas/learner.schema";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";

@Injectable()
export class LearnerLinkService {
  constructor(
    @InjectModel(LearnerInstructorLink.name)
    private linkModel: Model<LearnerInstructorLinkDocument>,
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>,
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
  ) {}

  /**
   * Discover instructors from existing lessons and create links
   * for any that don't already have one. Ensures legacy bookings
   * appear as linked instructors.
   */
  async syncLinksFromLessons(learnerId: string): Promise<void> {
    const instructorIds = await this.lessonModel.distinct("instructorId", {
      learnerId: new Types.ObjectId(learnerId),
    });

    if (instructorIds.length === 0) return;

    // Find which links already exist
    const existingLinks = await this.linkModel
      .find({
        learnerId: new Types.ObjectId(learnerId),
        instructorId: { $in: instructorIds },
      })
      .select("instructorId");

    const existingSet = new Set(
      existingLinks.map((l) => l.instructorId.toString()),
    );

    const newInstructorIds = instructorIds.filter(
      (id) => !existingSet.has(id.toString()),
    );

    if (newInstructorIds.length === 0) return;

    // Create links with stats from existing lessons
    for (const instructorId of newInstructorIds) {
      const stats = await this.lessonModel.aggregate([
        {
          $match: {
            learnerId: new Types.ObjectId(learnerId),
            instructorId: new Types.ObjectId(instructorId),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
            totalSpent: { $sum: "$price" },
            lastLesson: { $max: "$startTime" },
            firstLesson: { $min: "$createdAt" },
          },
        },
      ]);

      const s = stats[0] || {};

      await this.linkModel.create({
        learnerId: new Types.ObjectId(learnerId),
        instructorId: new Types.ObjectId(instructorId),
        balance: 0,
        totalLessons: s.total || 0,
        completedLessons: s.completed || 0,
        cancelledLessons: s.cancelled || 0,
        totalSpent: s.totalSpent || 0,
        status: "active",
        startedAt: s.firstLesson || new Date(),
        lastLessonAt: s.lastLesson || null,
      });
    }

    // Set primary instructor if learner doesn't have one
    const learner = await this.learnerModel.findById(learnerId);
    if (learner && !learner.instructorId && newInstructorIds.length > 0) {
      learner.instructorId = new Types.ObjectId(newInstructorIds[0]);
      await learner.save();
    }
  }

  /**
   * Get or create a link between learner and instructor.
   * Called when a booking is made or learner chooses an instructor.
   */
  async getOrCreateLink(
    learnerId: string,
    instructorId: string,
  ): Promise<LearnerInstructorLinkDocument> {
    let link = await this.linkModel.findOne({
      learnerId: new Types.ObjectId(learnerId),
      instructorId: new Types.ObjectId(instructorId),
    });

    if (!link) {
      // Verify both exist
      const [learner, instructor] = await Promise.all([
        this.learnerModel.findById(learnerId),
        this.instructorModel.findById(instructorId),
      ]);

      if (!learner) throw new NotFoundException("Learner not found");
      if (!instructor) throw new NotFoundException("Instructor not found");

      link = await this.linkModel.create({
        learnerId: new Types.ObjectId(learnerId),
        instructorId: new Types.ObjectId(instructorId),
        balance: 0,
        totalLessons: 0,
        completedLessons: 0,
        cancelledLessons: 0,
        totalSpent: 0,
        status: "active",
        startedAt: new Date(),
      });

      // Set as primary instructor if learner doesn't have one
      if (!learner.instructorId) {
        learner.instructorId = new Types.ObjectId(instructorId);
        await learner.save();
      }
    }

    // Reactivate if previously ended
    if (link.status === "ended") {
      link.status = "active";
      await link.save();
    }

    return link;
  }

  /**
   * Get all instructors linked to a learner.
   */
  async getLearnerInstructors(learnerId: string) {
    const links = await this.linkModel
      .find({
        learnerId: new Types.ObjectId(learnerId),
        status: { $in: ["active", "paused"] },
      })
      .sort({ lastLessonAt: -1 });

    // Enrich with instructor details
    const instructorIds = links.map((l) => l.instructorId);
    const instructors = await this.instructorModel
      .find({ _id: { $in: instructorIds } })
      .select(
        "firstName lastName profileImage hourlyRate lessonTypes vehicleInfo serviceAreas currency slug",
      )
      .lean();

    const instructorMap = new Map(
      instructors.map((i: any) => [i._id.toString(), i]),
    );

    return links.map((link) => {
      const instructor = instructorMap.get(link.instructorId.toString());
      return {
        linkId: link._id,
        instructorId: link.instructorId,
        instructor: instructor || null,
        balance: link.balance,
        totalLessons: link.totalLessons,
        completedLessons: link.completedLessons,
        totalSpent: link.totalSpent,
        status: link.status,
        defaultPickupLocation: link.defaultPickupLocation,
        startedAt: link.startedAt,
        lastLessonAt: link.lastLessonAt,
      };
    });
  }

  /**
   * Get all learners linked to an instructor (for instructor dashboard).
   */
  async getInstructorLearners(instructorId: string) {
    const links = await this.linkModel
      .find({
        instructorId: new Types.ObjectId(instructorId),
        status: { $in: ["active", "paused"] },
      })
      .sort({ lastLessonAt: -1 });

    const learnerIds = links.map((l) => l.learnerId);
    const learners = await this.learnerModel
      .find({ _id: { $in: learnerIds } })
      .select("firstName lastName email phone")
      .lean();

    const learnerMap = new Map(
      learners.map((l: any) => [l._id.toString(), l]),
    );

    return links.map((link) => {
      const learner = learnerMap.get(link.learnerId.toString());
      return {
        linkId: link._id,
        learnerId: link.learnerId,
        learner: learner || null,
        balance: link.balance,
        totalLessons: link.totalLessons,
        completedLessons: link.completedLessons,
        totalSpent: link.totalSpent,
        status: link.status,
        instructorNotes: link.instructorNotes,
        startedAt: link.startedAt,
        lastLessonAt: link.lastLessonAt,
      };
    });
  }

  /**
   * Add funds to a specific learner-instructor link balance.
   */
  async addBalance(
    learnerId: string,
    instructorId: string,
    amount: number,
  ): Promise<LearnerInstructorLinkDocument> {
    const link = await this.getOrCreateLink(learnerId, instructorId);

    const updated = await this.linkModel.findByIdAndUpdate(
      link._id,
      { $inc: { balance: amount, totalSpent: amount } },
      { new: true },
    );

    return updated!;
  }

  /**
   * Deduct balance atomically — returns null if insufficient.
   */
  async deductBalance(
    learnerId: string,
    instructorId: string,
    amount: number,
  ): Promise<LearnerInstructorLinkDocument | null> {
    return this.linkModel.findOneAndUpdate(
      {
        learnerId: new Types.ObjectId(learnerId),
        instructorId: new Types.ObjectId(instructorId),
        balance: { $gte: amount },
      },
      { $inc: { balance: -amount } },
      { new: true },
    );
  }

  /**
   * Record a lesson event on the link.
   */
  async recordLesson(
    learnerId: string,
    instructorId: string,
    status: "booked" | "completed" | "cancelled",
  ) {
    const inc: Record<string, number> = {};

    if (status === "booked") {
      inc.totalLessons = 1;
    } else if (status === "completed") {
      inc.completedLessons = 1;
    } else if (status === "cancelled") {
      inc.cancelledLessons = 1;
    }

    await this.linkModel.findOneAndUpdate(
      {
        learnerId: new Types.ObjectId(learnerId),
        instructorId: new Types.ObjectId(instructorId),
      },
      {
        $set: { lastLessonAt: new Date() },
        $inc: inc,
      },
    );
  }

  /**
   * Set learner's active/primary instructor.
   */
  async setPrimaryInstructor(learnerId: string, instructorId: string) {
    const link = await this.linkModel.findOne({
      learnerId: new Types.ObjectId(learnerId),
      instructorId: new Types.ObjectId(instructorId),
      status: "active",
    });

    if (!link) {
      throw new NotFoundException("No active relationship with this instructor");
    }

    await this.learnerModel.findByIdAndUpdate(learnerId, {
      instructorId: new Types.ObjectId(instructorId),
    });

    return link;
  }
}
