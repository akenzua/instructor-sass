import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import {
  WeeklyAvailability,
  WeeklyAvailabilityDocument,
} from "../../schemas/availability.schema";
import { Package, PackageDocument } from "../../schemas/package.schema";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";

export interface SearchInstructorsQuery {
  /** [longitude, latitude] — resolved from postcode */
  coordinates?: [number, number];
  /** Max distance in miles (default 10) */
  radius?: number;
  /** Filter: "manual" | "automatic" | "both" */
  transmission?: string;
  /** Filter: lesson type e.g. "standard", "test-prep", "motorway" */
  lessonType?: string;
  /** Filter: max hourly rate */
  maxPrice?: number;
  /** Filter: language */
  language?: string;
  /** Sort: "distance" | "price" | "rating" */
  sortBy?: string;
  /** Pagination */
  page?: number;
  limit?: number;
}

@Injectable()
export class InstructorSearchService {
  private readonly logger = new Logger(InstructorSearchService.name);

  constructor(
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(WeeklyAvailability.name)
    private weeklyModel: Model<WeeklyAvailabilityDocument>,
    @InjectModel(Package.name)
    private packageModel: Model<PackageDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
  ) {}

  async searchInstructors(query: SearchInstructorsQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);
    const skip = (page - 1) * limit;

    const filter: any = {
      isPublicProfileEnabled: true,
      acceptingNewStudents: true,
    };

    // Geo search — if coordinates provided, use $near
    let useGeoSearch = false;
    if (query.coordinates && query.coordinates[0] !== 0) {
      const radiusMiles = query.radius || 10;
      const radiusMeters = radiusMiles * 1609.34;

      filter.geoLocation = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: query.coordinates,
          },
          $maxDistance: radiusMeters,
        },
      };
      useGeoSearch = true;
    }

    // Transmission filter — match on vehicleInfo.transmission
    if (query.transmission) {
      filter["vehicleInfo.transmission"] = {
        $in: [query.transmission, "both"],
      };
    }

    // Lesson type filter
    if (query.lessonType) {
      filter["lessonTypes.type"] = query.lessonType;
    }

    // Max price filter
    if (query.maxPrice) {
      filter.hourlyRate = { $lte: query.maxPrice };
    }

    // Language filter
    if (query.language) {
      filter.languages = query.language;
    }

    // Sort — when using $near, MongoDB sorts by distance automatically
    let sort: any = {};
    if (!useGeoSearch) {
      switch (query.sortBy) {
        case "price":
        case "price_low":
          sort = { hourlyRate: 1 };
          break;
        case "price_high":
          sort = { hourlyRate: -1 };
          break;
        case "rating":
          sort = { passRate: -1, totalStudentsTaught: -1 };
          break;
        default:
          sort = { profileViews: -1 };
          break;
      }
    } else if (query.sortBy === "price") {
      // Can't combine $near with non-distance sort, so skip $near and use $geoWithin instead
      // For simplicity, just let distance sort apply when using coordinates
      sort = {};
    }

    let instructors: any[];
    let total: number;

    try {
      [instructors, total] = await Promise.all([
        this.instructorModel
          .find(filter)
          .select(
            "firstName lastName profileImage bio hourlyRate lessonTypes " +
              "vehicleInfo serviceAreas languages primaryLocation " +
              "passRate totalStudentsTaught yearsExperience " +
              "username currency geoLocation",
          )
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        this.instructorModel.countDocuments(filter),
      ]);
    } catch (err: any) {
      // $near queries fail if 2dsphere index is missing or documents have invalid geoLocation
      this.logger.warn(
        `Geo query failed (falling back to non-geo): ${err.message}`,
      );

      // Fall back: remove $near, search all, compute distance manually
      delete filter.geoLocation;

      switch (query.sortBy) {
        case "price":
        case "price_low":
          sort = { hourlyRate: 1 };
          break;
        case "price_high":
          sort = { hourlyRate: -1 };
          break;
        case "rating":
          sort = { passRate: -1, totalStudentsTaught: -1 };
          break;
        default:
          sort = { profileViews: -1 };
          break;
      }

      [instructors, total] = await Promise.all([
        this.instructorModel
          .find(filter)
          .select(
            "firstName lastName profileImage bio hourlyRate lessonTypes " +
              "vehicleInfo serviceAreas languages primaryLocation " +
              "passRate totalStudentsTaught yearsExperience " +
              "username currency geoLocation",
          )
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        this.instructorModel.countDocuments(filter),
      ]);
    }

    // Enrich with availability summary
    const results = await Promise.all(
      instructors.map(async (instructor: any) => {
        const weeklyAvail = await this.weeklyModel.find({
          instructorId: instructor._id,
          isAvailable: true,
        });

        const availableDays = weeklyAvail.map((wa) => wa.dayOfWeek);

        // Calculate total available hours per week
        let totalWeeklyMinutes = 0;
        for (const wa of weeklyAvail) {
          for (const slot of wa.slots) {
            const [startH, startM] = slot.start.split(":").map(Number);
            const [endH, endM] = slot.end.split(":").map(Number);
            totalWeeklyMinutes += endH * 60 + endM - (startH * 60 + startM);
          }
        }

        // Calculate distance if we have both coordinates
        let distanceMiles: number | null = null;
        if (
          query.coordinates &&
          instructor.geoLocation?.coordinates?.[0] !== 0
        ) {
          distanceMiles = this.haversineDistance(
            query.coordinates[1],
            query.coordinates[0],
            instructor.geoLocation.coordinates[1],
            instructor.geoLocation.coordinates[0],
          );
        }

        return {
          _id: instructor._id,
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          profileImage: instructor.profileImage,
          bio: instructor.bio,
          hourlyRate: instructor.hourlyRate,
          currency: instructor.currency || "GBP",
          lessonTypes: instructor.lessonTypes || [],
          vehicleInfo: instructor.vehicleInfo,
          serviceAreas: instructor.serviceAreas,
          languages: instructor.languages,
          passRate: instructor.passRate,
          totalStudentsTaught: instructor.totalStudentsTaught,
          yearsExperience: instructor.yearsExperience,
          username: instructor.username,
          primaryLocation: instructor.primaryLocation,
          distanceMiles: distanceMiles
            ? Math.round(distanceMiles * 10) / 10
            : null,
          distance: distanceMiles
            ? Math.round(distanceMiles * 10) / 10
            : null,
          availability: {
            availableDays,
            totalWeeklyHours: Math.round(totalWeeklyMinutes / 60),
          },
        };
      }),
    );

    return {
      instructors: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single instructor's full public profile by username or ID.
   */
  async getInstructorProfile(usernameOrId: string) {
    let instructor: InstructorDocument | null;

    if (usernameOrId.match(/^[0-9a-fA-F]{24}$/)) {
      instructor = await this.instructorModel
        .findOne({ _id: usernameOrId, isPublicProfileEnabled: true })
        .select("-password");
    } else {
      instructor = await this.instructorModel
        .findOne({ username: usernameOrId, isPublicProfileEnabled: true })
        .select("-password");
    }

    if (!instructor) {
      throw new NotFoundException("Instructor not found");
    }

    // Increment profile views
    await this.instructorModel.findByIdAndUpdate(instructor._id, {
      $inc: { profileViews: 1 },
    });

    const [weeklyAvailability, packages] = await Promise.all([
      this.weeklyModel.find({
        instructorId: instructor._id,
      }),
      this.packageModel.find({
        instructorId: instructor._id,
        isActive: true,
      }).sort({ price: 1 }),
    ]);

    return {
      instructor: {
        _id: instructor._id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        profileImage: instructor.profileImage,
        coverImage: instructor.coverImage,
        bio: instructor.bio,
        about: instructor.about,
        hourlyRate: instructor.hourlyRate,
        currency: instructor.currency || "GBP",
        lessonTypes: instructor.lessonTypes || [],
        vehicleInfo: instructor.vehicleInfo,
        serviceAreas: instructor.serviceAreas,
        socialLinks: instructor.socialLinks,
        languages: instructor.languages,
        passRate: instructor.passRate,
        totalStudentsTaught: instructor.totalStudentsTaught,
        yearsExperience: instructor.yearsExperience,
        qualifications: instructor.qualifications,
        specializations: instructor.specializations,
        username: instructor.username,
        primaryLocation: instructor.primaryLocation,
        cancellationPolicy: instructor.cancellationPolicy,
        acceptingNewStudents: instructor.acceptingNewStudents,
      },
      weeklyAvailability: weeklyAvailability.map((wa) => ({
        dayOfWeek: wa.dayOfWeek,
        slots: wa.slots,
        isAvailable: wa.isAvailable,
      })),
      packages,
    };
  }

  /**
   * Resolve a UK postcode to coordinates using postcodes.io (free, no API key).
   */
  async resolvePostcode(
    postcode: string,
  ): Promise<{ lat: number; lng: number; area: string } | null> {
    try {
      const cleaned = postcode.replace(/\s/g, "").toUpperCase();
      const res = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`,
      );
      const data = await res.json();

      if (data.status === 200 && data.result) {
        return {
          lat: data.result.latitude,
          lng: data.result.longitude,
          area: data.result.admin_district || data.result.region || "",
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /** Haversine formula — distance between two lat/lng points in miles */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 3959; // Earth radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
