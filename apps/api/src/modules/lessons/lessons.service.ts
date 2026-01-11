import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";
import { CreateLessonDto, UpdateLessonDto, LessonQueryDto } from "./dto/lesson.dto";
import { LearnersService } from "../learners/learners.service";

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    @Inject(forwardRef(() => LearnersService))
    private learnersService: LearnersService
  ) {}

  async create(instructorId: string, dto: CreateLessonDto): Promise<LessonDocument> {
    // Find the learner (may or may not be assigned to an instructor yet)
    const learner = await this.learnersService.findByIdAny(dto.learnerId);
    
    if (!learner) {
      throw new NotFoundException("Learner not found");
    }

    // If learner has an instructorId, verify it matches
    if (learner.instructorId && learner.instructorId.toString() !== instructorId) {
      throw new BadRequestException("Learner belongs to another instructor");
    }

    // If learner has no instructor, assign them to this instructor
    if (!learner.instructorId) {
      await this.learnersService.assignToInstructor(dto.learnerId, instructorId);
    }

    const lesson = await this.lessonModel.create({
      ...dto,
      instructorId: new Types.ObjectId(instructorId),
      learnerId: new Types.ObjectId(dto.learnerId),
    });

    // Increment learner's total lessons
    await this.learnersService.incrementLessonCount(dto.learnerId, false);

    return this.findById(instructorId, lesson._id.toString());
  }

  async findAll(instructorId: string, query: LessonQueryDto) {
    const { page = 1, limit = 50, from, to, learnerId, status, paymentStatus } = query;

    const filter: Record<string, unknown> = { instructorId: new Types.ObjectId(instructorId) };

    if (from || to) {
      filter.startTime = {};
      if (from) (filter.startTime as Record<string, Date>).$gte = new Date(from);
      if (to) (filter.startTime as Record<string, Date>).$lte = new Date(to);
    }

    if (learnerId) {
      filter.learnerId = new Types.ObjectId(learnerId);
    }

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const [items, total] = await Promise.all([
      this.lessonModel
        .aggregate([
          { $match: filter },
          { $sort: { startTime: 1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: "learners",
              localField: "learnerId",
              foreignField: "_id",
              as: "learner",
            },
          },
          { $unwind: { path: "$learner", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              instructorId: 1,
              learnerId: 1,
              startTime: 1,
              endTime: 1,
              duration: 1,
              type: 1,
              status: 1,
              paymentStatus: 1,
              price: 1,
              pickupLocation: 1,
              dropoffLocation: 1,
              notes: 1,
              createdAt: 1,
              updatedAt: 1,
              "learner._id": 1,
              "learner.firstName": 1,
              "learner.lastName": 1,
              "learner.email": 1,
              "learner.phone": 1,
            },
          },
        ]),
      this.lessonModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(instructorId: string, id: string): Promise<LessonDocument> {
    const [lesson] = await this.lessonModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
          instructorId: new Types.ObjectId(instructorId),
        },
      },
      {
        $lookup: {
          from: "learners",
          localField: "learnerId",
          foreignField: "_id",
          as: "learner",
        },
      },
      { $unwind: { path: "$learner", preserveNullAndEmptyArrays: true } },
    ]);

    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }
    return lesson;
  }

  async update(
    instructorId: string,
    id: string,
    dto: UpdateLessonDto
  ): Promise<LessonDocument> {
    const lesson = await this.lessonModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), instructorId: new Types.ObjectId(instructorId) },
      { $set: dto },
      { new: true }
    );
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }
    return this.findById(instructorId, id);
  }

  async cancel(
    instructorId: string,
    id: string,
    reason?: string
  ): Promise<LessonDocument> {
    const lesson = await this.lessonModel.findOne({ _id: new Types.ObjectId(id), instructorId: new Types.ObjectId(instructorId) });
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    if (lesson.status !== "scheduled") {
      throw new BadRequestException("Only scheduled lessons can be cancelled");
    }

    lesson.status = "cancelled";
    lesson.cancellationReason = reason;
    lesson.cancelledAt = new Date();
    await lesson.save();

    return this.findById(instructorId, id);
  }

  async complete(
    instructorId: string,
    id: string,
    notes?: string
  ): Promise<LessonDocument> {
    const lesson = await this.lessonModel.findOne({ _id: new Types.ObjectId(id), instructorId: new Types.ObjectId(instructorId) });
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    if (lesson.status !== "scheduled") {
      throw new BadRequestException("Only scheduled lessons can be completed");
    }

    lesson.status = "completed";
    lesson.completedAt = new Date();
    if (notes) {
      lesson.instructorNotes = notes;
    }
    await lesson.save();

    // Update learner's balance (negative = owes money)
    await this.learnersService.updateBalance(
      lesson.learnerId.toString(),
      -lesson.price
    );

    // Increment completed lessons count
    await this.learnersService.incrementLessonCount(
      lesson.learnerId.toString(),
      true
    );

    return this.findById(instructorId, id);
  }

  async delete(instructorId: string, id: string): Promise<void> {
    const result = await this.lessonModel.deleteOne({ _id: new Types.ObjectId(id), instructorId: new Types.ObjectId(instructorId) });
    if (result.deletedCount === 0) {
      throw new NotFoundException("Lesson not found");
    }
  }

  async updatePaymentStatus(
    lessonIds: string[],
    paymentStatus: string
  ): Promise<void> {
    await this.lessonModel.updateMany(
      { _id: { $in: lessonIds.map((id) => new Types.ObjectId(id)) } },
      { $set: { paymentStatus } }
    );
  }

  async getStats(instructorId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const instructorObjId = new Types.ObjectId(instructorId);

    const [todayLessons, weekLessons, unpaidStats, monthlyEarnings] =
      await Promise.all([
        // Today's lessons
        this.lessonModel.countDocuments({
          instructorId: instructorObjId,
          startTime: { $gte: startOfDay, $lt: endOfDay },
          status: "scheduled",
        }),

        // Week lessons
        this.lessonModel.countDocuments({
          instructorId: instructorObjId,
          startTime: { $gte: startOfWeek },
          status: "scheduled",
        }),

        // Unpaid lessons
        this.lessonModel.aggregate([
          {
            $match: {
              instructorId: instructorObjId,
              status: "completed",
              paymentStatus: "pending",
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: "$price" },
            },
          },
        ]),

        // Monthly earnings
        this.lessonModel.aggregate([
          {
            $match: {
              instructorId: instructorObjId,
              completedAt: { $gte: startOfMonth, $lt: endOfMonth },
              paymentStatus: "paid",
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$price" },
            },
          },
        ]),
      ]);

    const unpaid = unpaidStats[0] || { count: 0, amount: 0 };
    const earnings = monthlyEarnings[0]?.total || 0;

    return {
      todayLessons,
      weekLessons,
      unpaidLessons: unpaid.count,
      unpaidAmount: unpaid.amount,
      monthlyEarnings: earnings,
    };
  }
}
