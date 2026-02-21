import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Model, Types } from "mongoose";
import Stripe from "stripe";
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
import { Payment, PaymentDocument } from "../../schemas/payment.schema";
import { BookLessonDto, PurchasePackageDto, SearchInstructorsDto } from "./dto/public.dto";
import { AuthService } from "../auth/auth.service";
import { EmailService } from "../email/email.service";
import { PostcodeService } from "./postcode.service";

@Injectable()
export class PublicService {
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(PublicService.name);

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
    private learnerModel: Model<LearnerDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private emailService: EmailService,
    private configService: ConfigService,
    private postcodeService: PostcodeService
  ) {
    const stripeKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: "2024-12-18.acacia" as any,
      });
    }
  }

  /**
   * Search instructors with filters
   * Supports geospatial search when location is a valid UK postcode
   */
  async searchInstructors(dto: SearchInstructorsDto) {
    const {
      query,
      location,
      radius,
      lat,
      lng,
      transmission,
      minRating,
      maxPrice,
      minPassRate,
      minExperience,
      acceptingStudents,
      specializations,
      languages,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = '1',
      limit = '12',
    } = dto;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const radiusMiles = radius ? parseFloat(radius) : 10; // Default 10 miles

    // Try to geocode the location if provided
    let geoCoords: { lat: number; lng: number } | null = null;
    let geoLocationName: string | null = null;

    // If lat/lng provided directly (e.g., from browser geolocation)
    if (lat && lng) {
      geoCoords = { lat: parseFloat(lat), lng: parseFloat(lng) };
    } 
    // Otherwise try to geocode the location string
    else if (location) {
      const geoResult = await this.postcodeService.geocodeLocation(location);
      if (geoResult) {
        geoCoords = { lat: geoResult.latitude, lng: geoResult.longitude };
        geoLocationName = geoResult.formattedLocation;
        this.logger.log(`Geocoded "${location}" to ${geoResult.latitude}, ${geoResult.longitude} (${geoLocationName})`);
      }
    }

    // If we have geo coordinates, use aggregation with $geoNear
    if (geoCoords) {
      return this.searchInstructorsWithGeo(dto, geoCoords, radiusMiles, geoLocationName);
    }

    // Otherwise, fall back to regular text-based search
    return this.searchInstructorsWithText(dto);
  }

  /**
   * Search instructors using geospatial queries
   */
  private async searchInstructorsWithGeo(
    dto: SearchInstructorsDto,
    coords: { lat: number; lng: number },
    radiusMiles: number,
    locationName: string | null
  ) {
    const {
      query,
      location,
      transmission,
      maxPrice,
      minPassRate,
      minExperience,
      acceptingStudents,
      specializations,
      languages,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = '1',
      limit = '12',
    } = dto;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build match filters
    const matchFilter: any = {
      isPublicProfileEnabled: true,
    };

    // Text search for name, bio
    if (query) {
      matchFilter.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { businessName: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
      ];
    }

    // Transmission filter
    if (transmission && ['manual', 'automatic', 'both'].includes(transmission)) {
      if (transmission === 'both') {
        matchFilter['vehicleInfo.transmission'] = 'both';
      } else {
        matchFilter['vehicleInfo.transmission'] = { $in: [transmission, 'both'] };
      }
    }

    // Price filter
    if (maxPrice) {
      matchFilter.hourlyRate = { $lte: parseFloat(maxPrice) };
    }

    // Pass rate filter
    if (minPassRate) {
      matchFilter.passRate = { $gte: parseFloat(minPassRate) };
    }

    // Experience filter
    if (minExperience) {
      matchFilter.yearsExperience = { $gte: parseInt(minExperience, 10) };
    }

    // Accepting students filter
    if (acceptingStudents === 'true') {
      matchFilter.acceptingNewStudents = true;
    }

    // Specializations filter
    if (specializations) {
      const specs = specializations.split(',').map(s => s.trim());
      matchFilter.specializations = { $in: specs };
    }

    // Build sort stage
    let sortStage: any = {};
    switch (sortBy) {
      case 'distance':
        sortStage.distance = 1; // Always ascending for distance
        break;
      case 'price':
        sortStage.hourlyRate = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'experience':
        sortStage.yearsExperience = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'passRate':
        sortStage.passRate = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'rating':
      default:
        sortStage.passRate = -1; // Default: highest pass rate first
        break;
    }

    const maxDistanceMeters = this.postcodeService.milesToMeters(radiusMiles);

    // Use aggregation with $geoNear
    const pipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat], // GeoJSON: [lng, lat]
          },
          distanceField: 'distanceMeters',
          maxDistance: maxDistanceMeters,
          spherical: true,
          query: matchFilter,
        },
      },
      {
        $addFields: {
          distance: { $divide: ['$distanceMeters', 1609.344] }, // Convert to miles
        },
      },
      { $sort: sortStage },
    ];

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.instructorModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add pagination and projection
    pipeline.push(
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          password: 0,
          stripeAccountId: 0,
          email: 0,
          phone: 0,
        },
      }
    );

    const instructors = await this.instructorModel.aggregate(pipeline);

    // Get stats for each instructor
    const instructorsWithStats = await Promise.all(
      instructors.map(async (instructor) => {
        const stats = await this.getInstructorStats(instructor._id.toString());
        return {
          ...instructor,
          distance: Math.round(instructor.distance * 10) / 10, // Round to 1 decimal
          stats,
        };
      })
    );

    return {
      instructors: instructorsWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      search: {
        type: 'geo',
        location: locationName || `${coords.lat}, ${coords.lng}`,
        radiusMiles,
        coordinates: coords,
      },
    };
  }

  /**
   * Search instructors using text-based matching (fallback)
   */
  private async searchInstructorsWithText(dto: SearchInstructorsDto) {
    const {
      query,
      location,
      transmission,
      maxPrice,
      minPassRate,
      minExperience,
      acceptingStudents,
      specializations,
      languages,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = '1',
      limit = '12',
    } = dto;

    // Build filter query
    const filter: any = {
      isPublicProfileEnabled: true,
    };

    // Text search for name, bio, service areas
    if (query) {
      filter.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { businessName: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { serviceAreas: { $regex: query, $options: 'i' } }, // serviceAreas is array of strings
        { 'serviceAreas.name': { $regex: query, $options: 'i' } }, // or array of objects
        { 'serviceAreas.postcode': { $regex: query, $options: 'i' } },
        { primaryLocation: { $regex: query, $options: 'i' } },
      ];
    }

    // Location filter (text-based fallback)
    if (location) {
      const locationFilters = [
        { serviceAreas: { $regex: location, $options: 'i' } },
        { 'serviceAreas.name': { $regex: location, $options: 'i' } },
        { 'serviceAreas.postcode': { $regex: location, $options: 'i' } },
        { primaryLocation: { $regex: location, $options: 'i' } },
      ];
      
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: locationFilters },
        ];
        delete filter.$or;
      } else {
        filter.$or = locationFilters;
      }
    }

    // Transmission filter
    if (transmission && ['manual', 'automatic', 'both'].includes(transmission)) {
      if (transmission === 'both') {
        filter['vehicleInfo.transmission'] = 'both';
      } else {
        filter['vehicleInfo.transmission'] = { $in: [transmission, 'both'] };
      }
    }

    // Price filter
    if (maxPrice) {
      filter.hourlyRate = { $lte: parseFloat(maxPrice) };
    }

    // Pass rate filter
    if (minPassRate) {
      filter.passRate = { $gte: parseFloat(minPassRate) };
    }

    // Experience filter
    if (minExperience) {
      filter.yearsExperience = { $gte: parseInt(minExperience, 10) };
    }

    // Accepting students filter
    if (acceptingStudents === 'true') {
      filter.acceptingNewStudents = true;
    }

    // Specializations filter
    if (specializations) {
      const specs = specializations.split(',').map(s => s.trim());
      filter.specializations = { $in: specs };
    }

    // Languages filter
    if (languages) {
      const langs = languages.split(',').map(l => l.trim());
      filter.languages = { $in: langs };
    }

    // Build sort options
    const sortOptions: any = {};
    switch (sortBy) {
      case 'price':
        sortOptions.hourlyRate = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'experience':
        sortOptions.yearsExperience = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'passRate':
        sortOptions.passRate = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'rating':
      default:
        sortOptions.passRate = sortOrder === 'asc' ? 1 : -1;
        break;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [instructors, total] = await Promise.all([
      this.instructorModel
        .find(filter)
        .select('-password -stripeAccountId -email -phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      this.instructorModel.countDocuments(filter),
    ]);

    // Get stats for each instructor
    const instructorsWithStats = await Promise.all(
      instructors.map(async (instructor) => {
        const stats = await this.getInstructorStats(instructor._id.toString());
        return {
          ...instructor,
          stats,
        };
      })
    );

    return {
      instructors: instructorsWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      search: {
        type: 'text',
        query: query || location || null,
      },
    };
  }

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
   * Creates a pending lesson and payment intent for payment at booking
   */
  async bookLesson(username: string, dto: BookLessonDto) {
    if (!this.stripe) {
      throw new BadRequestException("Payment system not configured");
    }

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

    // Find or create learner (without instructor ID initially for self-signup)
    let learner = await this.learnerModel.findOne({
      email: dto.learnerEmail.toLowerCase(),
    });

    if (!learner) {
      learner = await this.learnerModel.create({
        email: dto.learnerEmail.toLowerCase(),
        firstName: dto.learnerFirstName,
        lastName: dto.learnerLastName,
        phone: dto.learnerPhone,
        status: 'active',
      });
    } else {
      // Update learner details if they weren't set before
      if (!learner.firstName && dto.learnerFirstName) {
        learner.firstName = dto.learnerFirstName;
        learner.lastName = dto.learnerLastName;
        learner.phone = dto.learnerPhone;
        await learner.save();
      }
    }

    // Calculate duration and price
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    const price = (durationMinutes / 60) * instructor.hourlyRate;

    // Create lesson with PENDING-PAYMENT status (not confirmed until paid)
    const lesson = await this.lessonModel.create({
      instructorId: instructor._id,
      learnerId: learner._id,
      startTime,
      endTime,
      duration: durationMinutes,
      status: "pending-confirmation", // Will be confirmed after payment
      paymentStatus: "pending",
      price,
      pickupLocation: dto.pickupLocation,
      notes: dto.notes,
    });

    // Create Stripe PaymentIntent
    const instructorName = `${instructor.firstName} ${instructor.lastName}`;
    const formattedDate = startTime.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(price * 100), // Convert to pence
      currency: (instructor.currency || 'GBP').toLowerCase(),
      metadata: {
        instructorId: instructor._id.toString(),
        learnerId: learner._id.toString(),
        lessonId: lesson._id.toString(),
        type: 'booking',
      },
      description: `Driving lesson with ${instructorName} on ${formattedDate}`,
    });

    // Create payment record
    const payment = await this.paymentModel.create({
      type: 'lesson-booking',
      instructorId: instructor._id,
      learnerId: learner._id,
      lessonIds: [lesson._id],
      amount: price,
      currency: instructor.currency || 'GBP',
      status: 'pending',
      method: 'card',
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      description: `Lesson booking - ${formattedDate}`,
    });

    return {
      success: true,
      message: 'Please complete payment to confirm your booking',
      bookingId: lesson._id.toString(),
      paymentId: payment._id.toString(),
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      price,
      currency: instructor.currency || 'GBP',
      instructorName,
      requiresPayment: true,
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

  /**
   * Confirm booking after successful payment
   * Updates lesson and payment status, sends confirmation email
   */
  async confirmBookingPayment(paymentIntentId: string) {
    if (!this.stripe) {
      throw new BadRequestException("Payment system not configured");
    }

    // Verify payment with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException(`Payment not completed. Status: ${paymentIntent.status}`);
    }

    // Find the payment record
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      throw new NotFoundException("Payment record not found");
    }

    // Check if already processed
    if (payment.status === 'succeeded') {
      // Already processed, return success
      const lesson = await this.lessonModel.findById(payment.lessonIds[0]);
      return {
        success: true,
        message: 'Booking already confirmed',
        bookingId: lesson?._id.toString(),
        alreadyProcessed: true,
      };
    }

    // Atomically claim the payment to prevent double-processing
    const claimed = await this.paymentModel.findOneAndUpdate(
      { _id: payment._id, status: 'pending' },
      { $set: { status: 'succeeded', paidAt: new Date() } },
      { new: true }
    );

    if (!claimed) {
      // Race condition: another call already processed it
      const lesson = await this.lessonModel.findById(payment.lessonIds[0]);
      return {
        success: true,
        message: 'Booking already confirmed',
        bookingId: lesson?._id.toString(),
        alreadyProcessed: true,
      };
    }

    // Update learner balance with the payment amount
    const learnerIdStr = payment.learnerId.toString();
    try {
      await this.learnerModel.findByIdAndUpdate(
        payment.learnerId,
        { $inc: { balance: payment.amount } }
      );
      console.log('[PublicBooking] Updated balance for learner:', learnerIdStr, 'by +', payment.amount);
    } catch (err) {
      // Revert payment status so it can be retried
      console.error('[PublicBooking] Failed to update learner balance, reverting payment:', err);
      await this.paymentModel.findByIdAndUpdate(payment._id, { $set: { status: 'pending', paidAt: null } });
      throw err;
    }

    // Update lesson status to scheduled and payment status to paid
    const lesson = await this.lessonModel.findByIdAndUpdate(
      payment.lessonIds[0],
      { 
        status: 'scheduled',
        paymentStatus: 'paid',
      },
      { new: true }
    ).populate('instructorId', 'firstName lastName email');

    if (!lesson) {
      throw new NotFoundException("Lesson not found");
    }

    // Get learner details
    const learner = await this.learnerModel.findById(payment.learnerId);
    if (!learner) {
      throw new NotFoundException("Learner not found");
    }

    // Generate magic link token for learner portal access
    const token = this.authService.generateMagicToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.authService.storeMagicLinkToken(token, learner.email, expiresAt);

    // Send booking confirmation email
    const instructor = lesson.instructorId as any;
    const instructorName = `${instructor.firstName} ${instructor.lastName}`;
    const formattedDate = lesson.startTime.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    const formattedTime = lesson.startTime.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    await this.emailService.sendBookingConfirmationEmail(
      learner.email,
      token,
      {
        learnerName: learner.firstName || 'there',
        instructorName,
        date: formattedDate,
        time: formattedTime,
        duration: lesson.duration,
        price: lesson.price,
        currency: payment.currency || 'GBP',
        isPaid: true,
      }
    );

    // Send payment receipt email (non-blocking)
    this.emailService.sendPaymentReceiptEmail(learner.email, {
      learnerName: learner.firstName || 'there',
      instructorName,
      amount: payment.amount,
      currency: payment.currency || 'GBP',
      paymentType: payment.type || 'top-up',
      paymentMethod: payment.method || 'card',
      paymentId: payment._id.toString(),
      paidAt: payment.paidAt || new Date(),
      description: payment.description,
    }).catch(err => console.error('[PublicBooking] Failed to send receipt email:', err));

    return {
      success: true,
      message: 'Booking confirmed! Check your email for details.',
      bookingId: lesson._id.toString(),
      lessonDate: lesson.startTime,
      instructorName,
    };
  }
}
