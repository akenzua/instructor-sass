import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Learner, LearnerDocument } from "../../schemas/learner.schema";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";
import { Package, PackageDocument } from "../../schemas/package.schema";
import {
  Instructor,
  InstructorDocument,
} from "../../schemas/instructor.schema";
import {
  WeeklyAvailability,
  WeeklyAvailabilityDocument,
  AvailabilityOverride,
  AvailabilityOverrideDocument,
} from "../../schemas/availability.schema";
import { Payment, PaymentDocument } from "../../schemas/payment.schema";
import { BookLessonDto, BookPackageDto } from "./dto/booking.dto";
import { LearnerLinkService } from "./learner-link.service";

@Injectable()
export class LearnersBookingService {
  constructor(
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    @InjectModel(Package.name)
    private packageModel: Model<PackageDocument>,
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(WeeklyAvailability.name)
    private weeklyModel: Model<WeeklyAvailabilityDocument>,
    @InjectModel(AvailabilityOverride.name)
    private overrideModel: Model<AvailabilityOverrideDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    private linkService: LearnerLinkService,
  ) {}

  /**
   * Link a learner to an instructor (creates a link if it doesn't exist).
   */
  async linkInstructor(learnerId: string, instructorId: string) {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) throw new NotFoundException("Learner not found");

    const link = await this.linkService.getOrCreateLink(learnerId, instructorId);

    return {
      linkId: link._id,
      instructorId: link.instructorId,
      balance: link.balance,
      status: link.status,
    };
  }

  /**
   * Get all instructors the learner is linked to.
   */
  async getMyInstructors(learnerId: string) {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) throw new NotFoundException("Learner not found");

    // Ensure links exist for any instructors from past lessons
    await this.linkService.syncLinksFromLessons(learnerId);

    const instructors = await this.linkService.getLearnerInstructors(learnerId);

    return {
      instructors,
      primaryInstructorId: learner.instructorId?.toString() || null,
      globalBalance: learner.balance,
    };
  }

  /**
   * Switch the active instructor for the booking flow.
   */
  async switchInstructor(learnerId: string, instructorId: string) {
    await this.linkService.setPrimaryInstructor(learnerId, instructorId);
    return this.getInstructorAvailability(learnerId, instructorId);
  }

  /**
   * Get a specific instructor's info for the booking page.
   * If no instructorId given, uses the learner's primary or most recent link.
   */
  async getInstructorAvailability(learnerId: string, instructorId?: string) {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) throw new NotFoundException("Learner not found");

    // Ensure links exist for any instructors from past lessons
    await this.linkService.syncLinksFromLessons(learnerId);

    // Determine which instructor to show
    let resolvedInstructorId: string;

    if (instructorId) {
      resolvedInstructorId = instructorId;
    } else if (learner.instructorId) {
      resolvedInstructorId = learner.instructorId.toString();
    } else {
      // No primary — check if they have any links
      const links = await this.linkService.getLearnerInstructors(learnerId);
      if (links.length === 0) {
        return {
          instructor: null,
          weeklyAvailability: [],
          unscheduledLessons: 0,
          balance: 0,
          needsInstructor: true,
          allInstructors: [],
        };
      }
      // Auto-select the most recent linked instructor
      resolvedInstructorId = links[0].instructorId.toString();

      // Also set as primary so future calls are faster
      await this.linkService.setPrimaryInstructor(learnerId, resolvedInstructorId);
    }

    // Query next 4 weeks of override dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fourWeeksLater = new Date(today);
    fourWeeksLater.setDate(today.getDate() + 28);
    const todayStr = today.toISOString().split("T")[0];
    const endStr = fourWeeksLater.toISOString().split("T")[0];

    const [instructor, weeklyAvailability, availabilityOverrides] = await Promise.all([
      this.instructorModel
        .findById(resolvedInstructorId)
        .select(
          "firstName lastName profileImage bio hourlyRate lessonTypes " +
            "vehicleInfo serviceAreas currency cancellationPolicy " +
            "acceptingNewStudents languages username",
        ),
      this.weeklyModel.find({
        instructorId: new Types.ObjectId(resolvedInstructorId),
      }),
      this.overrideModel.find({
        instructorId: new Types.ObjectId(resolvedInstructorId),
        date: { $gte: todayStr, $lte: endStr },
      }),
    ]);

    if (!instructor) throw new NotFoundException("Instructor not found");

    // ── Compute available booking slots (same logic as public service) ──
    // Get existing lessons to exclude booked times
    const existingLessons = await this.lessonModel
      .find({
        instructorId: new Types.ObjectId(resolvedInstructorId),
        startTime: { $gte: today, $lte: fourWeeksLater },
        status: { $in: ["scheduled", "completed"] },
      })
      .select("startTime endTime")
      .lean();

    // Build map of booked times by date
    const bookedTimes = new Map<string, Array<{ start: string; end: string }>>();
    for (const lesson of existingLessons) {
      const dateKey = lesson.startTime.toISOString().split("T")[0];
      if (!bookedTimes.has(dateKey)) {
        bookedTimes.set(dateKey, []);
      }
      const sh = String(lesson.startTime.getHours()).padStart(2, "0");
      const sm = String(lesson.startTime.getMinutes()).padStart(2, "0");
      const eh = String(lesson.endTime.getHours()).padStart(2, "0");
      const em = String(lesson.endTime.getMinutes()).padStart(2, "0");
      bookedTimes.get(dateKey)!.push({ start: `${sh}:${sm}`, end: `${eh}:${em}` });
    }

    // Build override map
    const overrideMap = new Map(
      availabilityOverrides.map((o) => [o.date, o]),
    );

    // Build weekly map
    const weeklyMap = new Map(
      weeklyAvailability.map((w) => [w.dayOfWeek, w]),
    );

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const availableSlots: Array<{
      date: string;
      startTime: string;
      endTime: string;
    }> = [];
    const current = new Date(today);

    while (current <= fourWeeksLater) {
      const dateStr = current.toISOString().split("T")[0];
      const dayName = dayNames[current.getDay()];
      const override = overrideMap.get(dateStr);

      if (override) {
        if (override.isAvailable) {
          for (const slot of override.slots || []) {
            availableSlots.push(
              ...this.generateSlotsForDay(
                dateStr,
                slot.start,
                slot.end,
                30, // 30-min granularity
                bookedTimes.get(dateStr) || [],
              ),
            );
          }
        }
      } else {
        const daySchedule = weeklyMap.get(dayName);
        if (daySchedule && daySchedule.isAvailable) {
          for (const slot of daySchedule.slots || []) {
            availableSlots.push(
              ...this.generateSlotsForDay(
                dateStr,
                slot.start,
                slot.end,
                30,
                bookedTimes.get(dateStr) || [],
              ),
            );
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    // Get or create the link for balance
    const link = await this.linkService.getOrCreateLink(
      learnerId,
      resolvedInstructorId,
    );

    // Count unscheduled package lessons
    const unscheduledLessons = await this.lessonModel.countDocuments({
      learnerId: new Types.ObjectId(learnerId),
      instructorId: new Types.ObjectId(resolvedInstructorId),
      packageId: { $exists: true },
      status: "pending-confirmation",
    });

    // Get all linked instructors for the switcher UI
    const allInstructors =
      await this.linkService.getLearnerInstructors(learnerId);

    return {
      instructor: {
        _id: instructor._id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        profileImage: instructor.profileImage,
        bio: instructor.bio,
        hourlyRate: instructor.hourlyRate,
        lessonTypes: instructor.lessonTypes || [],
        vehicleInfo: instructor.vehicleInfo,
        serviceAreas: instructor.serviceAreas,
        currency: instructor.currency || "GBP",
        cancellationPolicy: instructor.cancellationPolicy,
        acceptingNewStudents: instructor.acceptingNewStudents,
        languages: instructor.languages,
        username: instructor.username,
      },
      weeklyAvailability: weeklyAvailability.map((wa) => ({
        dayOfWeek: wa.dayOfWeek,
        slots: wa.slots,
        isAvailable: wa.isAvailable,
      })),
      availabilityOverrides: availabilityOverrides.map((ao) => ({
        date: ao.date,
        slots: ao.slots,
        isAvailable: ao.isAvailable,
        reason: ao.reason,
      })),
      availableSlots,
      unscheduledLessons,
      balance: learner.balance,
      needsInstructor: false,
      allInstructors: allInstructors.map((ai) => ({
        instructorId: ai.instructorId,
        name: ai.instructor
          ? `${ai.instructor.firstName} ${ai.instructor.lastName}`
          : "Unknown",
        profileImage: ai.instructor?.profileImage,
        balance: ai.balance,
        totalLessons: ai.totalLessons,
      })),
    };
  }

  /**
   * Get active packages the instructor offers.
   */
  async getInstructorPackages(learnerId: string, instructorId?: string) {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) throw new NotFoundException("Learner not found");

    const resolvedId = instructorId || learner.instructorId?.toString();
    if (!resolvedId) {
      return [];
    }

    return this.packageModel
      .find({
        instructorId: new Types.ObjectId(resolvedId),
        isActive: true,
      })
      .sort({ price: 1 });
  }

  /**
   * Book a single lesson. Deducts from the learner's global balance.
   */
  async bookLesson(learnerId: string, dto: BookLessonDto) {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) throw new NotFoundException("Learner not found");

    const instructorId = dto.instructorId || learner.instructorId?.toString();
    if (!instructorId) {
      throw new BadRequestException(
        "No instructor specified. Please select an instructor first.",
      );
    }

    const instructor = await this.instructorModel.findById(instructorId);
    if (!instructor) throw new NotFoundException("Instructor not found");

    // Ensure link exists
    await this.linkService.getOrCreateLink(
      learnerId,
      instructorId,
    );

    // Resolve price from instructor's lesson types or hourly rate
    const lessonType = dto.type || "standard";
    const typeConfig = instructor.lessonTypes?.find(
      (lt) => lt.type === lessonType,
    );

    let price: number;
    if (typeConfig) {
      price = typeConfig.price * (dto.duration / (typeConfig.duration || 60));
    } else {
      price = instructor.hourlyRate * (dto.duration / 60);
    }
    price = Math.round(price * 100) / 100;

    // Check global learner balance
    if (learner.balance < price) {
      throw new BadRequestException(
        `Insufficient balance. Need £${price.toFixed(2)} but you have £${learner.balance.toFixed(2)}. Please top up first.`,
      );
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(startTime.getTime() + dto.duration * 60 * 1000);

    // Check for instructor time conflicts
    const conflict = await this.lessonModel.findOne({
      instructorId: new Types.ObjectId(instructorId),
      status: { $in: ["scheduled", "pending-confirmation"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      throw new BadRequestException(
        "This time slot conflicts with an existing lesson",
      );
    }

    // Check learner doesn't have a conflicting lesson with ANY instructor
    const learnerConflict = await this.lessonModel.findOne({
      learnerId: new Types.ObjectId(learnerId),
      status: { $in: ["scheduled", "pending-confirmation"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (learnerConflict) {
      throw new BadRequestException(
        "You already have a lesson at this time",
      );
    }

    // Deduct from global learner balance atomically
    const updatedLearner = await this.learnerModel.findOneAndUpdate(
      { _id: learnerId, balance: { $gte: price } },
      { $inc: { balance: -price } },
      { new: true },
    );

    if (!updatedLearner) {
      throw new BadRequestException("Insufficient balance");
    }

    // Create lesson
    const lesson = await this.lessonModel.create({
      instructorId: new Types.ObjectId(instructorId),
      learnerId: new Types.ObjectId(learnerId),
      startTime,
      endTime,
      duration: dto.duration,
      type: lessonType,
      status: "scheduled",
      paymentStatus: "paid",
      price,
      pickupLocation: dto.pickupLocation,
      notes: dto.notes,
    });

    // Record on link
    await this.linkService.recordLesson(learnerId, instructorId, "booked");

    // Create payment record for the booking
    const instructorName = `${instructor.firstName} ${instructor.lastName}`.trim();
    const lessonDate = startTime.toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
    const lessonTime = startTime.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit',
    });
    await this.paymentModel.create({
      type: 'lesson-booking',
      instructorId: new Types.ObjectId(instructorId),
      learnerId: new Types.ObjectId(learnerId),
      lessonIds: [lesson._id],
      amount: price,
      currency: 'GBP',
      status: 'succeeded',
      method: 'balance',
      description: `Lesson with ${instructorName} — ${lessonDate} at ${lessonTime}`,
      paidAt: new Date(),
    });

    return {
      lesson,
      newBalance: updatedLearner.balance,
    };
  }

  /**
   * Book a package: deduct full package price from link balance, create
   * placeholder lessons with status "pending-confirmation".
   */
  async bookPackage(learnerId: string, dto: BookPackageDto) {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) throw new NotFoundException("Learner not found");

    const pkg = await this.packageModel.findById(dto.packageId);
    if (!pkg || !pkg.isActive) {
      throw new NotFoundException("Package not found or no longer available");
    }

    const instructorId = pkg.instructorId.toString();

    // Ensure link exists
    await this.linkService.getOrCreateLink(
      learnerId,
      instructorId,
    );

    // Check global learner balance
    if (learner.balance < pkg.price) {
      throw new BadRequestException(
        `Insufficient balance. Need £${pkg.price.toFixed(2)} but you have £${learner.balance.toFixed(2)}. Please top up first.`,
      );
    }

    // Deduct from global learner balance atomically
    const updatedLearner = await this.learnerModel.findOneAndUpdate(
      { _id: learnerId, balance: { $gte: pkg.price } },
      { $inc: { balance: -pkg.price } },
      { new: true },
    );

    if (!updatedLearner) {
      throw new BadRequestException("Insufficient balance");
    }

    // Create placeholder lessons
    const pricePerLesson =
      Math.round((pkg.price / pkg.lessonCount) * 100) / 100;
    const lessons = [];

    for (let i = 0; i < pkg.lessonCount; i++) {
      const lesson = await this.lessonModel.create({
        instructorId: new Types.ObjectId(instructorId),
        learnerId: new Types.ObjectId(learnerId),
        startTime: new Date(0),
        endTime: new Date(0),
        duration: 60,
        type: "standard",
        status: "pending-confirmation",
        paymentStatus: "paid",
        price: pricePerLesson,
        packageId: new Types.ObjectId(dto.packageId),
        packageLessonNumber: i + 1,
        packageTotalLessons: pkg.lessonCount,
        notes: dto.notes
          ? `${dto.notes} (Package: ${pkg.name} — Lesson ${i + 1}/${pkg.lessonCount})`
          : `Package: ${pkg.name} — Lesson ${i + 1}/${pkg.lessonCount}`,
      });
      lessons.push(lesson);
    }

    // Record on link
    await this.linkService.recordLesson(learnerId, instructorId, "booked");

    // Create payment record for the package booking
    await this.paymentModel.create({
      type: 'package-booking',
      instructorId: new Types.ObjectId(instructorId),
      learnerId: new Types.ObjectId(learnerId),
      lessonIds: lessons.map((l) => l._id),
      packageId: new Types.ObjectId(dto.packageId),
      amount: pkg.price,
      currency: 'GBP',
      status: 'succeeded',
      method: 'balance',
      description: `Package: ${pkg.name} (${pkg.lessonCount} lessons)`,
      paidAt: new Date(),
    });

    return {
      package: pkg,
      lessons,
      newBalance: updatedLearner.balance,
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────
  private generateSlotsForDay(
    date: string,
    dayStart: string,
    dayEnd: string,
    durationMinutes: number,
    bookedTimes: Array<{ start: string; end: string }>,
  ): Array<{ date: string; startTime: string; endTime: string }> {
    const slots: Array<{ date: string; startTime: string; endTime: string }> =
      [];

    const [startHour, startMin] = dayStart.split(":").map(Number);
    const [endHour, endMin] = dayEnd.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + durationMinutes <= endMinutes) {
      const slotStart = `${Math.floor(currentMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(currentMinutes % 60)
        .toString()
        .padStart(2, "0")}`;
      const slotEndMinutes = currentMinutes + durationMinutes;
      const slotEnd = `${Math.floor(slotEndMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(slotEndMinutes % 60)
        .toString()
        .padStart(2, "0")}`;

      // Check if slot conflicts with any booked time
      const isBooked = bookedTimes.some((booked) => {
        const [bsh, bsm] = booked.start.split(":").map(Number);
        const [beh, bem] = booked.end.split(":").map(Number);
        const bookedStart = bsh * 60 + bsm;
        const bookedEnd = beh * 60 + bem;

        return (
          (currentMinutes >= bookedStart && currentMinutes < bookedEnd) ||
          (slotEndMinutes > bookedStart && slotEndMinutes <= bookedEnd) ||
          (currentMinutes <= bookedStart && slotEndMinutes >= bookedEnd)
        );
      });

      if (!isBooked) {
        slots.push({ date, startTime: slotStart, endTime: slotEnd });
      }

      currentMinutes += 30;
    }

    return slots;
  }
}
