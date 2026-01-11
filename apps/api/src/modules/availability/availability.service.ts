import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  WeeklyAvailability,
  WeeklyAvailabilityDocument,
  AvailabilityOverride,
  AvailabilityOverrideDocument,
  DaysOfWeek,
} from "../../schemas/availability.schema";
import {
  UpdateWeeklyAvailabilityDto,
  CreateOverrideDto,
} from "./dto/availability.dto";

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(WeeklyAvailability.name)
    private weeklyModel: Model<WeeklyAvailabilityDocument>,
    @InjectModel(AvailabilityOverride.name)
    private overrideModel: Model<AvailabilityOverrideDocument>
  ) {}

  async getWeeklyAvailability(
    instructorId: string
  ): Promise<WeeklyAvailabilityDocument[]> {
    let availability = await this.weeklyModel.find({ instructorId });

    // If no availability exists, create defaults
    if (availability.length === 0) {
      const defaults = DaysOfWeek.map((day) => ({
        instructorId,
        dayOfWeek: day,
        slots:
          day === "saturday" || day === "sunday"
            ? []
            : [{ start: "09:00", end: "17:00" }],
        isAvailable: day !== "saturday" && day !== "sunday",
      }));

      availability = await this.weeklyModel.insertMany(defaults) as any;
    }

    return availability;
  }

  async updateWeeklyAvailability(
    instructorId: string,
    dto: UpdateWeeklyAvailabilityDto[]
  ): Promise<WeeklyAvailabilityDocument[]> {
    const operations = dto.map((item) => ({
      updateOne: {
        filter: { instructorId, dayOfWeek: item.dayOfWeek },
        update: {
          $set: {
            slots: item.slots,
            isAvailable: item.isAvailable,
          },
        },
        upsert: true,
      },
    }));

    await this.weeklyModel.bulkWrite(operations as any);
    return this.getWeeklyAvailability(instructorId);
  }

  async getOverrides(
    instructorId: string,
    from?: string,
    to?: string
  ): Promise<AvailabilityOverrideDocument[]> {
    const filter: Record<string, unknown> = { instructorId };

    if (from || to) {
      filter.date = {};
      if (from) (filter.date as Record<string, string>).$gte = from;
      if (to) (filter.date as Record<string, string>).$lte = to;
    }

    return this.overrideModel.find(filter).sort({ date: 1 });
  }

  async createOverride(
    instructorId: string,
    dto: CreateOverrideDto
  ): Promise<AvailabilityOverrideDocument> {
    return this.overrideModel.findOneAndUpdate(
      { instructorId, date: dto.date },
      {
        $set: {
          slots: dto.slots || [],
          isAvailable: dto.isAvailable,
          reason: dto.reason,
        },
      },
      { upsert: true, new: true }
    );
  }

  async deleteOverride(instructorId: string, date: string): Promise<void> {
    await this.overrideModel.deleteOne({ instructorId, date });
  }
}
