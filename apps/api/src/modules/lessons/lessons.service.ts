import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import { Payment, PaymentDocument } from "../../schemas/payment.schema";
import { CreateLessonDto, UpdateLessonDto, LessonQueryDto } from "./dto/lesson.dto";
import { LearnersService } from "../learners/learners.service";

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
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
    reason?: string,
    cancelledBy: string = "instructor"
  ): Promise<LessonDocument> {
    const lesson = await this.lessonModel.findOne({ _id: new Types.ObjectId(id), instructorId: new Types.ObjectId(instructorId) });
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    if (lesson.status !== "scheduled") {
      throw new BadRequestException("Only scheduled lessons can be cancelled");
    }

    // Get instructor's cancellation policy
    const instructor = await this.instructorModel.findById(instructorId);
    const policy = instructor?.cancellationPolicy;

    // Calculate cancellation fee based on policy and who cancelled
    const { fee, refund } = this.calculateCancellationFee(
      lesson.price,
      lesson.startTime,
      cancelledBy,
      policy
    );

    lesson.status = "cancelled";
    lesson.cancellationReason = reason;
    lesson.cancelledBy = cancelledBy;
    lesson.cancellationFee = fee;
    lesson.cancellationRefundAmount = refund;
    lesson.cancelledAt = new Date();
    await lesson.save();

    // Adjust learner balance: charge the fee (negative = owes money)
    if (fee > 0) {
      await this.learnersService.updateBalance(
        lesson.learnerId.toString(),
        -fee
      );

      // Create payment record for the cancellation fee charged to learner
      const instructorName = instructor
        ? `${instructor.firstName} ${instructor.lastName}`.trim()
        : 'Instructor';
      const lessonDate = lesson.startTime.toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
      });
      await this.paymentModel.create({
        type: 'cancellation-fee',
        instructorId: lesson.instructorId,
        learnerId: lesson.learnerId,
        lessonIds: [lesson._id],
        amount: fee,
        currency: 'GBP',
        status: 'succeeded',
        method: 'balance',
        description: `Cancellation fee — lesson on ${lessonDate} (cancelled by ${cancelledBy})`,
        paidAt: new Date(),
      });
    }

    // If there's a refund back to learner, record it
    if (refund > 0) {
      await this.learnersService.updateBalance(
        lesson.learnerId.toString(),
        refund
      );

      const lessonDate = lesson.startTime.toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
      });
      await this.paymentModel.create({
        type: 'refund',
        instructorId: lesson.instructorId,
        learnerId: lesson.learnerId,
        lessonIds: [lesson._id],
        amount: refund,
        currency: 'GBP',
        status: 'succeeded',
        method: 'balance',
        description: `Cancellation refund — lesson on ${lessonDate}`,
        paidAt: new Date(),
      });
    }

    return this.findById(instructorId, id);
  }

  /**
   * Allow a learner to cancel their own lesson.
   * Enforces the instructor's cancellation policy.
   */
  async cancelByLearner(
    learnerId: string,
    lessonId: string,
    reason?: string
  ): Promise<{ lesson: LessonDocument; fee: number; refund: number }> {
    const lesson = await this.lessonModel.findOne({
      _id: new Types.ObjectId(lessonId),
      learnerId: new Types.ObjectId(learnerId),
    });
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    if (lesson.status !== "scheduled") {
      throw new BadRequestException("Only scheduled lessons can be cancelled");
    }

    // Get instructor's cancellation policy
    const instructor = await this.instructorModel.findById(lesson.instructorId);
    const policy = instructor?.cancellationPolicy;

    // Check if learner cancellation is allowed
    if (policy && !policy.allowLearnerCancellation) {
      throw new ForbiddenException(
        "Your instructor does not allow learner-initiated cancellations. Please contact your instructor directly."
      );
    }

    // Calculate fee
    const { fee, refund } = this.calculateCancellationFee(
      lesson.price,
      lesson.startTime,
      "learner",
      policy
    );

    lesson.status = "cancelled";
    lesson.cancellationReason = reason;
    lesson.cancelledBy = "learner";
    lesson.cancellationFee = fee;
    lesson.cancellationRefundAmount = refund;
    lesson.cancelledAt = new Date();
    await lesson.save();

    // Charge the cancellation fee to learner balance
    if (fee > 0) {
      await this.learnersService.updateBalance(learnerId, -fee);

      // Create payment record for the cancellation fee
      const instructorName = instructor
        ? `${instructor.firstName} ${instructor.lastName}`.trim()
        : 'Instructor';
      const lessonDate = lesson.startTime.toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
      });
      await this.paymentModel.create({
        type: 'cancellation-fee',
        instructorId: lesson.instructorId,
        learnerId: new Types.ObjectId(learnerId),
        lessonIds: [lesson._id],
        amount: fee,
        currency: 'GBP',
        status: 'succeeded',
        method: 'balance',
        description: `Cancellation fee — lesson with ${instructorName} on ${lessonDate}`,
        paidAt: new Date(),
      });
    }

    // If there's a refund back to balance, record it
    if (refund > 0) {
      await this.learnersService.updateBalance(learnerId, refund);

      const instructorName = instructor
        ? `${instructor.firstName} ${instructor.lastName}`.trim()
        : 'Instructor';
      const lessonDate = lesson.startTime.toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
      });
      await this.paymentModel.create({
        type: 'refund',
        instructorId: lesson.instructorId,
        learnerId: new Types.ObjectId(learnerId),
        lessonIds: [lesson._id],
        amount: refund,
        currency: 'GBP',
        status: 'succeeded',
        method: 'balance',
        description: `Cancellation refund — lesson with ${instructorName} on ${lessonDate}`,
        paidAt: new Date(),
      });
    }

    return { lesson, fee, refund };
  }

  /**
   * Preview what the cancellation fee would be for a learner
   * without actually cancelling.
   */
  async previewCancellationFee(
    learnerId: string,
    lessonId: string
  ): Promise<{
    lessonId: string;
    lessonPrice: number;
    paymentStatus: string;
    fee: number;
    refundAmount: number;
    chargePercent: number;
    hoursUntilLesson: number;
    tier: string;
    currentBalance: number;
    balanceAfterCancel: number;
    policyText?: string;
    allowLearnerCancellation: boolean;
  }> {
    const lesson = await this.lessonModel.findOne({
      _id: new Types.ObjectId(lessonId),
      learnerId: new Types.ObjectId(learnerId),
    });
    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    const instructor = await this.instructorModel.findById(lesson.instructorId);
    const policy = instructor?.cancellationPolicy;

    // Get current learner balance
    const learner = await this.learnersService.findByIdAny(learnerId);
    const currentBalance = learner?.balance ?? 0;

    const hoursUntil = (lesson.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    const { fee, refund, chargePercent, tier } = this.calculateCancellationFee(
      lesson.price,
      lesson.startTime,
      "learner",
      policy
    );

    // Balance after cancellation: fee is deducted
    const balanceAfterCancel = Math.round((currentBalance - fee) * 100) / 100;

    return {
      lessonId: lesson._id.toString(),
      lessonPrice: lesson.price,
      paymentStatus: lesson.paymentStatus,
      fee,
      refundAmount: refund,
      chargePercent,
      hoursUntilLesson: Math.max(0, Math.round(hoursUntil * 10) / 10),
      tier,
      currentBalance,
      balanceAfterCancel,
      policyText: policy?.policyText,
      allowLearnerCancellation: policy?.allowLearnerCancellation ?? true,
    };
  }

  /**
   * Calculate cancellation fee and refund amounts based on policy.
   */
  private calculateCancellationFee(
    lessonPrice: number,
    lessonStartTime: Date,
    cancelledBy: string,
    policy?: any
  ): { fee: number; refund: number; chargePercent: number; tier: string } {
    // If instructor cancels, no fee to the learner
    if (cancelledBy === "instructor") {
      return { fee: 0, refund: lessonPrice, chargePercent: 0, tier: "instructor-cancelled" };
    }

    // Default policy if instructor hasn't configured one
    const freeWindow = policy?.freeCancellationWindowHours ?? 48;
    const lateWindow = policy?.lateCancellationWindowHours ?? 24;
    const lateCharge = policy?.lateCancellationChargePercent ?? 50;
    const veryLateCharge = policy?.veryLateCancellationChargePercent ?? 100;

    const hoursUntil = (lessonStartTime.getTime() - Date.now()) / (1000 * 60 * 60);

    let chargePercent: number;
    let tier: string;

    if (hoursUntil >= freeWindow) {
      // Free cancellation window
      chargePercent = 0;
      tier = "free";
    } else if (hoursUntil >= lateWindow) {
      // Late cancellation window
      chargePercent = lateCharge;
      tier = "late";
    } else {
      // Very late cancellation (under threshold)
      chargePercent = veryLateCharge;
      tier = "very-late";
    }

    const fee = Math.round((lessonPrice * chargePercent) / 100 * 100) / 100;
    const refund = Math.round((lessonPrice - fee) * 100) / 100;

    return { fee, refund, chargePercent, tier };
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
