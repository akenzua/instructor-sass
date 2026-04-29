import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type VehicleDocument = Vehicle & Document;

export const VehicleStatuses = ["active", "maintenance", "retired"] as const;

@Schema({ timestamps: true })
export class Vehicle {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "School", required: true, index: true })
  schoolId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  make: string;

  @Prop({ required: true, trim: true })
  model: string;

  @Prop()
  year?: number;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  registration: string;

  @Prop({ enum: ["manual", "automatic", "both"], default: "manual" })
  transmission: string;

  @Prop({ trim: true })
  color?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: true })
  hasLearnerDualControls: boolean;

  @Prop({ enum: VehicleStatuses, default: "active" })
  status: string;

  @Prop()
  insuranceExpiry?: Date;

  @Prop()
  motExpiry?: Date;

  @Prop()
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

VehicleSchema.index({ schoolId: 1, status: 1 });

VehicleSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
