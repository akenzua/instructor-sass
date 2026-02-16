import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type LessonDocument = Lesson & Document;

export const LessonStatuses = ["pending-confirmation", "scheduled", "completed", "cancelled", "no-show"] as const;
export const LessonPaymentStatuses = ["pending", "paid", "refunded", "waived"] as const;
export const LessonTypes = ["standard", "test-prep", "mock-test", "motorway", "refresher"] as const;

@Schema({ timestamps: true })
export class Lesson {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Learner", required: true, index: true })
  learnerId: Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true, min: 30, max: 180 })
  duration: number; // minutes

  @Prop({ enum: LessonTypes, default: "standard" })
  type: string;

  @Prop({ enum: LessonStatuses, default: "scheduled" })
  status: string;

  @Prop({ enum: LessonPaymentStatuses, default: "pending" })
  paymentStatus: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  pickupLocation?: string;

  @Prop()
  dropoffLocation?: string;

  @Prop()
  notes?: string;

  @Prop()
  instructorNotes?: string;

  @Prop()
  cancellationReason?: string;

  @Prop({ enum: ["instructor", "learner", "system"] })
  cancelledBy?: string;

  @Prop({ min: 0 })
  cancellationFee?: number;

  @Prop({ min: 0 })
  cancellationRefundAmount?: number;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

// Indexes
LessonSchema.index({ instructorId: 1, startTime: 1 });
LessonSchema.index({ learnerId: 1, startTime: 1 });
LessonSchema.index({ instructorId: 1, status: 1 });
LessonSchema.index({ instructorId: 1, paymentStatus: 1 });

LessonSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
