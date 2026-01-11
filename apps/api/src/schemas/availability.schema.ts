import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type WeeklyAvailabilityDocument = WeeklyAvailability & Document;
export type AvailabilityOverrideDocument = AvailabilityOverride & Document;

export const DaysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

@Schema({ _id: false })
export class TimeSlot {
  @Prop({ required: true })
  start: string; // HH:MM format

  @Prop({ required: true })
  end: string; // HH:MM format
}

const TimeSlotSchema = SchemaFactory.createForClass(TimeSlot);

@Schema({ timestamps: true })
export class WeeklyAvailability {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ enum: DaysOfWeek, required: true })
  dayOfWeek: string;

  @Prop({ type: [TimeSlotSchema], default: [] })
  slots: TimeSlot[];

  @Prop({ default: true })
  isAvailable: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const WeeklyAvailabilitySchema = SchemaFactory.createForClass(WeeklyAvailability);

// Compound index to ensure one entry per day per instructor
WeeklyAvailabilitySchema.index({ instructorId: 1, dayOfWeek: 1 }, { unique: true });

@Schema({ timestamps: true })
export class AvailabilityOverride {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD format

  @Prop({ type: [TimeSlotSchema], default: [] })
  slots: TimeSlot[];

  @Prop({ default: false })
  isAvailable: boolean;

  @Prop()
  reason?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const AvailabilityOverrideSchema = SchemaFactory.createForClass(AvailabilityOverride);

// Compound index for date-specific overrides
AvailabilityOverrideSchema.index({ instructorId: 1, date: 1 }, { unique: true });

WeeklyAvailabilitySchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

AvailabilityOverrideSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
