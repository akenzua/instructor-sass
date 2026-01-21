import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
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
import { Package, PackageDocument } from "../../schemas/package.schema";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";
import { Learner, LearnerDocument } from "../../schemas/learner.schema";
import { BookLessonDto, PurchasePackageDto } from "./dto/public.dto";

@Injectable()
export class PublicService {
  constructor(
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(WeeklyAvailability.name)
    private weeklyAvailabilityModel: Model<WeeklyAvailabilityDocument>,
    @InjectModel(AvailabilityOverride.name)
    private availabilityOverrideModel: Model<AvailabilityOverrideDocument>,
    @InjectModel(Package.name)
    private packageModel: Model<PackageDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>
  ) {}

  /**
   * Get instructor by username (public profile)
   */
  async getInstructorByUsername(username: string) {
    const instructor = await this.instructorModel
      .findOne({
        username: username.toLowerCase(),
        isPublicProfileEnabled: true,
      })
      .select("-password -stripeAccountId -email -phone")
      .lean();

    if (!instructor) {
      throw new NotFoundException("Instructor not found");
    }

    // Increment profile views
    await this.instructorModel.updateOne(
      { _id: instructor._id },
      { $inc: { profileViews: 1 } }
    );

    // Calculate stats
    const stats = await this.getInstructorStats(instructor._id.toString());

    return {
      ...instructor,
      stats,
    };
  }

  /**
   * Get instructor's public packages
   */
  async getPackagesByUsername(username: string) {
    const instructor = await this.findInstructorByUsername(username);

    const packages = await this.packageModel
      .find({
        instructorId: instructor._id,
        isActive: true,
      })
      .select("-instructorId")
      .sort({ price: 1 })
      .lean();

    return packages;
  }

  /**
   * Get instructor's availability settings
   */
  async getAvailabilityByUsername(username: string) {
    const instructor = await this.findInstructorByUsername(username);

    if (!instructor.showAvailability) {
      return { message: "Availability is hidden by instructor", weeklySchedule: [] };
    }

    // Get weekly availability
    const weeklySchedule = await this.weeklyAvailabilityModel
      .find({ instructorId: instructor._id })
      .select("-instructorId")
      .lean();

    return { weeklySchedule };
  }

  /**
   * Get available booking slots for an instructor
   */
  async getAvailableSlots(
    username: string,
    startDate: string,
    endDate: string,
    durationMinutes: number = 60
  ) {
    const instructor = await this.findInstructorByUsername(username);

    if (!instructor.showAvailability) {
      throw new BadRequestException("Booking is not available for this instructor");
    }

    // Get weekly availability
    const weeklySchedule = await this.weeklyAvailabilityModel
      .find({ instructorId: instructor._id, isAvailable: true })
      .lean();

    if (!weeklySchedule.length) {
      return [];
    }

    // Get overrides for the date range
    const overrides = await this.availabilityOverrideModel
      .find({
        instructorId: instructor._id,
        date: { $gte: startDate, $lte: endDate },
      })
      .lean();

    // Create a map of overrides by date
    const overrideMap = new Map(overrides.map((o) => [o.date, o]));

    // Create a map of weekly schedule by day
    const weeklyMap = new Map(weeklySchedule.map((w) => [w.dayOfWeek, w]));

    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots: Array<{ date: string; startTime: string; endTime: string }> = [];

    // Get existing lessons to exclude booked times
    const existingLessons = await this.lessonModel
      .find({
        instructorId: instructor._id,
        startTime: { $gte: start, $lte: end },
        status: { $in: ["scheduled", "completed"] },
      })
      .select("startTime endTime")
      .lean();

    // Build map of booked times by date
    const bookedTimes = new Map<string, Array<{ start: string; end: string }>>();
    for (const lesson of existingLessons) {
      const dateKey = this.formatDate(lesson.startTime);
      if (!bookedTimes.has(dateKey)) {
        bookedTimes.set(dateKey, []);
      }
      bookedTimes.get(dateKey)!.push({
        start: this.formatTime(lesson.startTime),
        end: this.formatTime(lesson.endTime),
      });
    }

    // Iterate through each day
    const current = new Date(start);
    while (current <= end) {
      const dateStr = this.formatDate(current);
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const dayName = dayNames[current.getDay()];

      // Check if it's an exception date
      const override = overrideMap.get(dateStr);

      if (override) {
        if (!override.isAvailable) {
          // Day off, skip
          current.setDate(current.getDate() + 1);
          continue;
        }
        // Use override slots
        for (const slot of override.slots || []) {
          const daySlots = this.generateSlotsForDay(
            dateStr,
            slot.start,
            slot.end,
            durationMinutes,
            bookedTimes.get(dateStr) || []
          );
          slots.push(...daySlots);
        }
      } else {
        // Check regular weekly schedule
        const daySchedule = weeklyMap.get(dayName);

        if (daySchedule && daySchedule.isAvailable) {
          for (const slot of daySchedule.slots || []) {
            const daySlots = this.generateSlotsForDay(
              dateStr,
              slot.start,
              slot.end,
              durationMinutes,
              bookedTimes.get(dateStr) || []
            );
            slots.push(...daySlots);
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  /**
   * Book a lesson with an instructor
   */
  async bookLesson(username: string, dto: BookLessonDto) {
    const instructor = await this.findInstructorByUsername(username);

    if (!instructor.acceptingNewStudents) {
      throw new BadRequestException("Instructor is not accepting new students");
    }

    // Parse start and end times
    const startTime = this.parseDateTime(dto.date, dto.startTime);
    const endTime = this.parseDateTime(dto.date, dto.endTime);

    // Check slot availability
    const isAvailable = await this.checkSlotAvailability(
      instructor._id.toString(),
      startTime,
      endTime
    );

    if (!isAvailable) {
      throw new BadRequestException("This time slot is no longer available");
    }

    // Find or create learner
    let learner = await this.learnerModel.findOne({
      email: dto.learnerEmail.toLowerCase(),
      instructorId: instructor._id,
    });

    if (!learner) {
      learner = await this.learnerModel.create({
        email: dto.learnerEmail.toLowerCase(),
        firstName: dto.learnerFirstName,
        lastName: dto.learnerLastName,
        phone: dto.learnerPhone,
        instructorId: instructor._id,
      });
    }

    // Calculate duration and price
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    const price = (durationMinutes / 60) * instructor.hourlyRate;

    // Create lesson
    const lesson = await this.lessonModel.create({
      instructorId: instructor._id,
      learnerId: learner._id,
      startTime,
      endTime,
      duration: durationMinutes,
      status: "scheduled",
      price,
      pickupLocation: dto.pickupLocation,
      notes: dto.notes,
    });

    return {
      lessonId: lesson._id,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      price: lesson.price,
      currency: instructor.currency,
      instructorName: `${instructor.firstName} ${instructor.lastName}`,
    };
  }

  /**
   * Purchase a package
   */
  async purchasePackage(username: string, dto: PurchasePackageDto) {
    const instructor = await this.findInstructorByUsername(username);

    const pkg = await this.packageModel.findOne({
      _id: dto.packageId,
      instructorId: instructor._id,
      isActive: true,
    });

    if (!pkg) {
      throw new NotFoundException("Package not found");
    }

    // Find or create learner
    let learner = await this.learnerModel.findOne({
      email: dto.learnerEmail.toLowerCase(),
      instructorId: instructor._id,
    });

    if (!learner) {
      learner = await this.learnerModel.create({
        email: dto.learnerEmail.toLowerCase(),
        firstName: dto.learnerFirstName,
        lastName: dto.learnerLastName,
        phone: dto.learnerPhone,
        instructorId: instructor._id,
      });
    }

    // Create payment record or Stripe checkout session here
    // For now, return package details for frontend to handle payment
    return {
      packageId: pkg._id,
      packageName: pkg.name,
      lessonCount: pkg.lessonCount,
      price: pkg.price,
      currency: instructor.currency,
      learnerId: learner._id,
      instructorName: `${instructor.firstName} ${instructor.lastName}`,
      // In production, include Stripe checkout URL
      // checkoutUrl: await this.createStripeCheckout(...)
    };
  }

  /**
   * Get instructor reviews (placeholder - needs review schema)
   */
  async getReviewsByUsername(username: string) {
    const instructor = await this.findInstructorByUsername(username);

    // Placeholder - return mock data until review schema is implemented
    // In production, query from reviews collection
    return {
      items: [],
      total: 0,
      averageRating: 0,
    };
  }

  // === PRIVATE HELPER METHODS ===

  private async findInstructorByUsername(username: string) {
    const instructor = await this.instructorModel
      .findOne({
        username: username.toLowerCase(),
        isPublicProfileEnabled: true,
      })
      .lean();

    if (!instructor) {
      throw new NotFoundException("Instructor not found");
    }

    return instructor;
  }

  private async getInstructorStats(instructorId: string) {
    const completedLessons = await this.lessonModel.countDocuments({
      instructorId: new Types.ObjectId(instructorId),
      status: "completed",
    });

    const totalLearners = await this.learnerModel.countDocuments({
      instructorId: new Types.ObjectId(instructorId),
    });

    return {
      completedLessons,
      totalLearners,
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  private parseDateTime(date: string, time: string): Date {
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  private generateSlotsForDay(
    date: string,
    dayStart: string,
    dayEnd: string,
    durationMinutes: number,
    bookedTimes: Array<{ start: string; end: string }>
  ): Array<{ date: string; startTime: string; endTime: string }> {
    const slots: Array<{ date: string; startTime: string; endTime: string }> = [];

    const [startHour, startMin] = dayStart.split(":").map(Number);
    const [endHour, endMin] = dayEnd.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + durationMinutes <= endMinutes) {
      const slotStart = `${Math.floor(currentMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(currentMinutes % 60).toString().padStart(2, "0")}`;
      const slotEndMinutes = currentMinutes + durationMinutes;
      const slotEnd = `${Math.floor(slotEndMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(slotEndMinutes % 60).toString().padStart(2, "0")}`;

      // Check if slot conflicts with any booked time
      const isBooked = bookedTimes.some((booked) => {
        const [bookedStartHour, bookedStartMin] = booked.start.split(":").map(Number);
        const [bookedEndHour, bookedEndMin] = booked.end.split(":").map(Number);
        const bookedStartMinutes = bookedStartHour * 60 + bookedStartMin;
        const bookedEndMinutes = bookedEndHour * 60 + bookedEndMin;

        // Check for overlap
        return (
          (currentMinutes >= bookedStartMinutes && currentMinutes < bookedEndMinutes) ||
          (slotEndMinutes > bookedStartMinutes && slotEndMinutes <= bookedEndMinutes) ||
          (currentMinutes <= bookedStartMinutes && slotEndMinutes >= bookedEndMinutes)
        );
      });

      if (!isBooked) {
        slots.push({ date, startTime: slotStart, endTime: slotEnd });
      }

      // Move to next slot (30 min intervals)
      currentMinutes += 30;
    }

    return slots;
  }

  private async checkSlotAvailability(
    instructorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const conflictingLesson = await this.lessonModel.findOne({
      instructorId: new Types.ObjectId(instructorId),
      status: { $in: ["scheduled", "completed"] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    return !conflictingLesson;
  }
}
