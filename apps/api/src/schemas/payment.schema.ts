import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PaymentDocument = Payment & Document;

export const PaymentStatuses = [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "refunded",
  "cancelled",
] as const;

export const PaymentMethods = ["card", "cash", "bank_transfer"] as const;

@Schema({ timestamps: true })
export class Payment {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Learner", required: true, index: true })
  learnerId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: "Lesson", default: [] })
  lessonIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: "Package" })
  packageId?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ default: "GBP" })
  currency: string;

  @Prop({ enum: PaymentStatuses, default: "pending" })
  status: string;

  @Prop({ enum: PaymentMethods, default: "card" })
  method: string;

  @Prop({ index: true })
  stripePaymentIntentId?: string;

  @Prop()
  stripeClientSecret?: string;

  @Prop()
  description?: string;

  @Prop({ type: Map, of: String })
  metadata?: Map<string, string>;

  @Prop()
  paidAt?: Date;

  @Prop()
  refundedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ instructorId: 1, createdAt: -1 });
PaymentSchema.index({ learnerId: 1, createdAt: -1 });

PaymentSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
