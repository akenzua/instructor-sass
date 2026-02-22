import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
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
    // Convert string ID to ObjectId for proper MongoDB query
    const objectId = new Types.ObjectId(instructorId);
    
    let availability = await this.weeklyModel.find({ instructorId: objectId });

    // If no availability exists, create defaults
    if (availability.length === 0) {
      const defaults = DaysOfWeek.map((day) => ({
        instructorId: objectId,
        dayOfWeek: day,
        slots: [{ start: "09:00", end: "17:00" }],
        isAvailable: true,
      }));

      availability = await this.weeklyModel.insertMany(defaults) as any;
    }

    return availability;
  }

  async resetToDefaults(instructorId: string): Promise<WeeklyAvailabilityDocument[]> {
    const objectId = new Types.ObjectId(instructorId);
    // Delete existing availability
    await this.weeklyModel.deleteMany({ instructorId: objectId });
    
    // Create fresh defaults
    const defaults = DaysOfWeek.map((day) => ({
      instructorId: objectId,
      dayOfWeek: day,
      slots: [{ start: "09:00", end: "17:00" }],
      isAvailable: true,
    }));

    return await this.weeklyModel.insertMany(defaults) as any;
  }

  async updateWeeklyAvailability(
    instructorId: string,
    dto: UpdateWeeklyAvailabilityDto[]
  ): Promise<WeeklyAvailabilityDocument[]> {
    const objectId = new Types.ObjectId(instructorId);
    const operations = dto.map((item) => ({
      updateOne: {
        filter: { instructorId: objectId, dayOfWeek: item.dayOfWeek },
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
    const objectId = new Types.ObjectId(instructorId);
    const filter: Record<string, unknown> = { instructorId: objectId };

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
    const objectId = new Types.ObjectId(instructorId);
    return this.overrideModel.findOneAndUpdate(
      { instructorId: objectId, date: dto.date },
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
    const objectId = new Types.ObjectId(instructorId);
    await this.overrideModel.deleteOne({ instructorId: objectId, date });
  }
}
