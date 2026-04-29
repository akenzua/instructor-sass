import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as crypto from "crypto";
import { School, SchoolDocument } from "../../schemas/school.schema";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";
import { Payment, PaymentDocument } from "../../schemas/payment.schema";
import {
  SchoolInvitation,
  SchoolInvitationDocument,
} from "../../schemas/school-invitation.schema";
import { Package, PackageDocument } from "../../schemas/package.schema";
import { Syllabus, SyllabusDocument, LearnerProgress, LearnerProgressDocument } from "../../schemas/syllabus.schema";
import { Learner, LearnerDocument } from "../../schemas/learner.schema";
import {
  LearnerInstructorLink,
  LearnerInstructorLinkDocument,
} from "../../schemas/learner-instructor-link.schema";
import {
  CreateSchoolDto,
  UpdateSchoolDto,
  InviteInstructorDto,
  UpdateInstructorRoleDto,
} from "./dto/school.dto";
import { EmailService } from "../email/email.service";
import { DEFAULT_DVSA_SYLLABUS } from "../syllabus/default-syllabus";

@Injectable()
export class SchoolsService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<SchoolDocument>,
    @InjectModel(Instructor.name) private instructorModel: Model<InstructorDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(SchoolInvitation.name)
    private schoolInvitationModel: Model<SchoolInvitationDocument>,
    @InjectModel(Package.name) private packageModel: Model<PackageDocument>,
    @InjectModel(Syllabus.name) private syllabusModel: Model<SyllabusDocument>,
    @InjectModel(Learner.name) private learnerModel: Model<LearnerDocument>,
    @InjectModel(LearnerInstructorLink.name)
    private learnerInstructorLinkModel: Model<LearnerInstructorLinkDocument>,
    @InjectModel(LearnerProgress.name)
    private learnerProgressModel: Model<LearnerProgressDocument>,
    private emailService: EmailService,
  ) {}

  async create(instructorId: string, dto: CreateSchoolDto): Promise<SchoolDocument> {
    const instructor = await this.instructorModel.findById(instructorId);
    if (!instructor) {
      throw new NotFoundException("Instructor not found");
    }
    if (instructor.schoolId) {
      throw new ConflictException("You already belong to a school");
    }

    const existingSchool = await this.schoolModel.findOne({ email: dto.email.toLowerCase() });
    if (existingSchool) {
      throw new ConflictException("A school with this email already exists");
    }

    const school = await this.schoolModel.create({
      ...dto,
      email: dto.email.toLowerCase(),
      ownerId: new Types.ObjectId(instructorId),
    });

    // Update instructor with school info
    await this.instructorModel.findByIdAndUpdate(instructorId, {
      schoolId: school._id,
      role: "owner",
    });

    // Auto-seed DVSA default syllabus for the school
    await this.syllabusModel.create({
      schoolId: school._id,
      name: DEFAULT_DVSA_SYLLABUS.name,
      description: DEFAULT_DVSA_SYLLABUS.description,
      isDefault: true,
      topics: DEFAULT_DVSA_SYLLABUS.topics,
    });

    return school;
  }

  async findByInstructorId(instructorId: string): Promise<SchoolDocument | null> {
    const instructor = await this.instructorModel.findById(instructorId).select("schoolId").lean();
    if (!instructor?.schoolId) return null;
    return this.schoolModel.findById(instructor.schoolId);
  }

  async update(schoolId: string, dto: UpdateSchoolDto): Promise<SchoolDocument> {
    const school = await this.schoolModel.findByIdAndUpdate(
      schoolId,
      { $set: dto },
      { new: true },
    );
    if (!school) {
      throw new NotFoundException("School not found");
    }
    return school;
  }

  async inviteInstructor(schoolId: string, dto: InviteInstructorDto, invitedByInstructorId: string) {
    const email = dto.email.toLowerCase();

    // Check if already a member
    const existingMember = await this.instructorModel.findOne({
      email,
      schoolId: new Types.ObjectId(schoolId),
    });
    if (existingMember) {
      throw new ConflictException("This instructor is already a member of your school");
    }

    // Check pending invitation
    const existingInvite = await this.schoolInvitationModel.findOne({
      schoolId: new Types.ObjectId(schoolId),
      email,
      status: "pending",
    });
    if (existingInvite) {
      throw new ConflictException("An invitation has already been sent to this email");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.schoolInvitationModel.create({
      schoolId: new Types.ObjectId(schoolId),
      email,
      role: dto.role || "instructor",
      invitedBy: new Types.ObjectId(invitedByInstructorId),
      token,
      expiresAt,
    });

    // Send invitation email
    const school = await this.schoolModel.findById(schoolId).select("name").lean();
    const inviteLink = `${process.env.INSTRUCTOR_APP_URL || "http://localhost:3001"}/invitation?token=${token}`;

    await this.emailService.sendRawEmail(
      email,
      `You've been invited to join ${school?.name || "a driving school"}`,
      `<h2>School Invitation</h2>
       <p>You have been invited to join <strong>${school?.name}</strong> as ${dto.role === "admin" ? "an admin" : "an instructor"}.</p>
       <p><a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#3182ce;color:white;text-decoration:none;border-radius:6px;">Accept Invitation</a></p>
       <p>This invitation expires in 7 days.</p>`,
    );

    return invitation;
  }

  async listInvitations(schoolId: string) {
    return this.schoolInvitationModel
      .find({ schoolId: new Types.ObjectId(schoolId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async cancelInvitation(schoolId: string, invitationId: string) {
    const invitation = await this.schoolInvitationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(invitationId),
        schoolId: new Types.ObjectId(schoolId),
        status: "pending",
      },
      { $set: { status: "expired" } },
      { new: true },
    );
    if (!invitation) {
      throw new NotFoundException("Invitation not found or already processed");
    }
    return { message: "Invitation cancelled" };
  }

  async listInstructors(schoolId: string) {
    return this.instructorModel
      .find({ schoolId: new Types.ObjectId(schoolId) })
      .select("-password")
      .sort({ role: 1, firstName: 1 })
      .lean();
  }

  async updateInstructorRole(
    schoolId: string,
    targetInstructorId: string,
    dto: UpdateInstructorRoleDto,
    requesterId: string,
  ) {
    if (targetInstructorId === requesterId) {
      throw new BadRequestException("You cannot change your own role");
    }

    const target = await this.instructorModel.findOne({
      _id: new Types.ObjectId(targetInstructorId),
      schoolId: new Types.ObjectId(schoolId),
    });

    if (!target) {
      throw new NotFoundException("Instructor not found in this school");
    }

    if (target.role === "owner") {
      throw new ForbiddenException("Cannot change the school owner's role");
    }

    target.role = dto.role;
    await target.save();

    return { message: "Role updated", role: dto.role };
  }

  async removeInstructor(schoolId: string, targetInstructorId: string, requesterId: string) {
    if (targetInstructorId === requesterId) {
      throw new BadRequestException("You cannot remove yourself from the school");
    }

    const target = await this.instructorModel.findOne({
      _id: new Types.ObjectId(targetInstructorId),
      schoolId: new Types.ObjectId(schoolId),
    });

    if (!target) {
      throw new NotFoundException("Instructor not found in this school");
    }

    if (target.role === "owner") {
      throw new ForbiddenException("Cannot remove the school owner");
    }

    target.schoolId = undefined;
    target.role = undefined;
    await target.save();

    return { message: "Instructor removed from school" };
  }

  async getDashboard(schoolId: string) {
    const instructors = await this.instructorModel
      .find({ schoolId: new Types.ObjectId(schoolId) })
      .select("_id firstName lastName role email")
      .lean();

    const instructorIds = instructors.map((i) => i._id);

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [totalLessons, completedLessons, totalRevenue, activeLearners, monthlyRevenueRaw] = await Promise.all([
      this.lessonModel.countDocuments({ instructorId: { $in: instructorIds } }),
      this.lessonModel.countDocuments({
        instructorId: { $in: instructorIds },
        status: "completed",
      }),
      this.paymentModel.aggregate([
        { $match: { instructorId: { $in: instructorIds }, status: "succeeded" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      this.lessonModel.distinct("learnerId", {
        instructorId: { $in: instructorIds },
        status: { $in: ["scheduled", "completed"] },
      }),
      this.paymentModel.aggregate([
        { $match: { instructorId: { $in: instructorIds }, status: "succeeded", createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, amount: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // Per-instructor breakdown
    const [perInstructorLessons, perInstructorRevenue, perInstructorLearners] = await Promise.all([
      this.lessonModel.aggregate([
        { $match: { instructorId: { $in: instructorIds } } },
        { $group: { _id: "$instructorId", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } } } },
      ]),
      this.paymentModel.aggregate([
        { $match: { instructorId: { $in: instructorIds }, status: "succeeded" } },
        { $group: { _id: "$instructorId", total: { $sum: "$amount" } } },
      ]),
      this.lessonModel.aggregate([
        { $match: { instructorId: { $in: instructorIds }, status: { $in: ["scheduled", "completed"] } } },
        { $group: { _id: "$instructorId", learners: { $addToSet: "$learnerId" } } },
        { $project: { _id: 1, learnerCount: { $size: "$learners" } } },
      ]),
    ]);

    const lessonMap = Object.fromEntries(perInstructorLessons.map(r => [r._id.toString(), r]));
    const revenueMap = Object.fromEntries(perInstructorRevenue.map(r => [r._id.toString(), r.total]));
    const learnerMap = Object.fromEntries(perInstructorLearners.map(r => [r._id.toString(), r.learnerCount]));

    const instructorsWithStats = instructors.map(inst => ({
      ...inst,
      totalLessons: lessonMap[inst._id.toString()]?.total ?? 0,
      completedLessons: lessonMap[inst._id.toString()]?.completed ?? 0,
      totalRevenue: revenueMap[inst._id.toString()] ?? 0,
      activeLearners: learnerMap[inst._id.toString()] ?? 0,
    }));

    // Build monthly revenue history (fill gaps with 0)
    const monthlyRevenue: Array<{ year: number; month: number; amount: number; count: number }> = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = monthlyRevenueRaw.find((r: any) => r._id.year === year && r._id.month === month);
      monthlyRevenue.push({ year, month, amount: found?.amount ?? 0, count: found?.count ?? 0 });
    }

    return {
      instructorCount: instructors.length,
      instructors: instructorsWithStats,
      totalLessons,
      completedLessons,
      totalRevenue: totalRevenue[0]?.total ?? 0,
      activeLearnerCount: activeLearners.length,
      monthlyRevenue,
    };
  }

  // ============================================================================
  // School-level packages
  // ============================================================================

  async getInstructorDetail(schoolId: string, instructorId: string) {
    const instructor = await this.instructorModel.findOne({
      _id: new Types.ObjectId(instructorId),
      schoolId: new Types.ObjectId(schoolId),
    }).select("-password").lean();
    if (!instructor) throw new NotFoundException("Instructor not found in this school");

    const oid = new Types.ObjectId(instructorId);
    const [
      totalLessons,
      completedLessons,
      scheduledLessons,
      revenue,
      activeLearners,
      recentLessons,
    ] = await Promise.all([
      this.lessonModel.countDocuments({ instructorId: oid }),
      this.lessonModel.countDocuments({ instructorId: oid, status: "completed" }),
      this.lessonModel.countDocuments({ instructorId: oid, status: "scheduled" }),
      this.paymentModel.aggregate([
        { $match: { instructorId: oid, status: "succeeded" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      this.lessonModel.distinct("learnerId", {
        instructorId: oid,
        status: { $in: ["scheduled", "completed"] },
      }),
      this.lessonModel.find({ instructorId: oid })
        .sort({ startTime: -1 })
        .limit(10)
        .populate("learnerId", "firstName lastName")
        .lean(),
    ]);

    return {
      instructor,
      stats: {
        totalLessons,
        completedLessons,
        scheduledLessons,
        totalRevenue: revenue[0]?.total ?? 0,
        activeLearners: activeLearners.length,
      },
      recentLessons,
    };
  }

  /**
   * Get all learners for a specific instructor in the school,
   * with their lesson count, spend, and syllabus progress summary.
   */
  async getInstructorLearners(schoolId: string, instructorId: string) {
    // Verify instructor belongs to school
    const instructor = await this.instructorModel.findOne({
      _id: new Types.ObjectId(instructorId),
      schoolId: new Types.ObjectId(schoolId),
    }).lean();
    if (!instructor) throw new NotFoundException("Instructor not found in this school");

    const oid = new Types.ObjectId(instructorId);

    // Get all learner links for this instructor
    const links = await this.learnerInstructorLinkModel
      .find({ instructorId: oid })
      .populate("learnerId", "firstName lastName email phone status")
      .lean();

    // Get syllabus progress for all these learners
    const learnerIds = links.map((l) => l.learnerId && (l.learnerId as any)._id).filter(Boolean);
    const progressRecords = await this.learnerProgressModel
      .find({ instructorId: oid, learnerId: { $in: learnerIds } })
      .lean();

    // Build a map of learnerId -> progress summary
    const progressMap = new Map<string, { totalTopics: number; completed: number; inProgress: number; avgScore: number }>();
    for (const prog of progressRecords) {
      const topics = prog.topicProgress || [];
      const completed = topics.filter((t: any) => t.status === "completed").length;
      const inProgress = topics.filter((t: any) => t.status === "in-progress").length;
      const scored = topics.filter((t: any) => t.currentScore > 0);
      const avgScore = scored.length > 0
        ? scored.reduce((sum: number, t: any) => sum + t.currentScore, 0) / scored.length
        : 0;
      progressMap.set(prog.learnerId.toString(), {
        totalTopics: topics.length,
        completed,
        inProgress,
        avgScore: Math.round(avgScore * 10) / 10,
      });
    }

    return links.map((link) => {
      const learner = link.learnerId as any;
      const lid = learner?._id?.toString();
      const progress = progressMap.get(lid) || { totalTopics: 0, completed: 0, inProgress: 0, avgScore: 0 };
      return {
        _id: lid,
        firstName: learner?.firstName,
        lastName: learner?.lastName,
        email: learner?.email,
        phone: learner?.phone,
        status: link.status,
        totalLessons: link.totalLessons,
        completedLessons: link.completedLessons,
        totalSpent: link.totalSpent,
        testReadiness: link.testReadiness,
        lastLessonAt: link.lastLessonAt,
        progress,
      };
    });
  }

  /**
   * Get detailed learner view: profile, lesson history, syllabus progress breakdown.
   */
  async getInstructorLearnerDetail(schoolId: string, instructorId: string, learnerId: string) {
    const instructor = await this.instructorModel.findOne({
      _id: new Types.ObjectId(instructorId),
      schoolId: new Types.ObjectId(schoolId),
    }).lean();
    if (!instructor) throw new NotFoundException("Instructor not found in this school");

    const iOid = new Types.ObjectId(instructorId);
    const lOid = new Types.ObjectId(learnerId);

    const [link, learner, lessons, progressRecords] = await Promise.all([
      this.learnerInstructorLinkModel.findOne({ instructorId: iOid, learnerId: lOid }).lean(),
      this.learnerModel.findById(lOid).select("-password").lean(),
      this.lessonModel
        .find({ instructorId: iOid, learnerId: lOid })
        .sort({ startTime: -1 })
        .select("startTime endTime duration type status price topicTitle topicScore topicNotes")
        .lean(),
      this.learnerProgressModel
        .find({ instructorId: iOid, learnerId: lOid })
        .populate("syllabusId", "name topics")
        .lean(),
    ]);

    if (!link || !learner) throw new NotFoundException("Learner not found for this instructor");

    return {
      learner: {
        _id: learner._id,
        firstName: learner.firstName,
        lastName: learner.lastName,
        email: learner.email,
        phone: learner.phone,
        status: learner.status,
      },
      link: {
        status: link.status,
        totalLessons: link.totalLessons,
        completedLessons: link.completedLessons,
        cancelledLessons: link.cancelledLessons,
        totalSpent: link.totalSpent,
        testReadiness: link.testReadiness,
        testReadinessComment: link.testReadinessComment,
        startedAt: link.startedAt,
        lastLessonAt: link.lastLessonAt,
      },
      lessons,
      progress: progressRecords,
    };
  }

  async createSchoolPackage(schoolId: string, dto: any) {
    return this.packageModel.create({
      ...dto,
      schoolId: new Types.ObjectId(schoolId),
    });
  }

  async findSchoolPackages(schoolId: string) {
    return this.packageModel
      .find({ schoolId: new Types.ObjectId(schoolId) })
      .sort({ createdAt: -1 });
  }

  async updateSchoolPackage(schoolId: string, packageId: string, dto: any) {
    const pkg = await this.packageModel.findOneAndUpdate(
      { _id: new Types.ObjectId(packageId), schoolId: new Types.ObjectId(schoolId) },
      { $set: dto },
      { new: true },
    );
    if (!pkg) throw new NotFoundException("Package not found");
    return pkg;
  }

  async deleteSchoolPackage(schoolId: string, packageId: string) {
    const result = await this.packageModel.deleteOne({
      _id: new Types.ObjectId(packageId),
      schoolId: new Types.ObjectId(schoolId),
    });
    if (result.deletedCount === 0) throw new NotFoundException("Package not found");
    return { message: "Package deleted" };
  }

  // ============================================================================
  // School-level syllabus
  // ============================================================================

  async createSchoolSyllabus(schoolId: string, dto: any) {
    const oid = new Types.ObjectId(schoolId);
    if (dto.isDefault) {
      await this.syllabusModel.updateMany(
        { schoolId: oid, isDefault: true },
        { isDefault: false },
      );
    }
    return this.syllabusModel.create({ ...dto, schoolId: oid });
  }

  async findSchoolSyllabus(schoolId: string) {
    return this.syllabusModel
      .find({ schoolId: new Types.ObjectId(schoolId) })
      .sort({ isDefault: -1, createdAt: -1 });
  }

  async updateSchoolSyllabus(schoolId: string, syllabusId: string, dto: any) {
    const oid = new Types.ObjectId(schoolId);
    if (dto.isDefault) {
      await this.syllabusModel.updateMany(
        { schoolId: oid, isDefault: true, _id: { $ne: new Types.ObjectId(syllabusId) } },
        { isDefault: false },
      );
    }
    const syllabus = await this.syllabusModel.findOneAndUpdate(
      { _id: new Types.ObjectId(syllabusId), schoolId: oid },
      { $set: dto },
      { new: true },
    );
    if (!syllabus) throw new NotFoundException("Syllabus not found");
    return syllabus;
  }

  async deleteSchoolSyllabus(schoolId: string, syllabusId: string) {
    const result = await this.syllabusModel.deleteOne({
      _id: new Types.ObjectId(syllabusId),
      schoolId: new Types.ObjectId(schoolId),
    });
    if (result.deletedCount === 0) throw new NotFoundException("Syllabus not found");
    return { message: "Syllabus deleted" };
  }

  // ============================================================================
  // School policies (cancellation policy + lesson types)
  // ============================================================================

  async getSchoolPolicies(schoolId: string) {
    const school = await this.schoolModel.findById(schoolId).select("cancellationPolicy lessonTypes");
    if (!school) throw new NotFoundException("School not found");
    return {
      cancellationPolicy: school.cancellationPolicy || null,
      lessonTypes: school.lessonTypes || [],
    };
  }

  async updateSchoolPolicies(schoolId: string, dto: { cancellationPolicy?: any; lessonTypes?: any[] }) {
    const update: any = {};
    if (dto.cancellationPolicy !== undefined) update.cancellationPolicy = dto.cancellationPolicy;
    if (dto.lessonTypes !== undefined) update.lessonTypes = dto.lessonTypes;
    const school = await this.schoolModel.findByIdAndUpdate(schoolId, { $set: update }, { new: true });
    if (!school) throw new NotFoundException("School not found");
    return {
      cancellationPolicy: school.cancellationPolicy || null,
      lessonTypes: school.lessonTypes || [],
    };
  }
}
