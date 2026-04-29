import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type VehicleAssignmentDocument = VehicleAssignment & Document;

@Schema({ timestamps: true })
export class VehicleAssignment {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Vehicle", required: true, index: true })
  vehicleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "School", required: true, index: true })
  schoolId: Types.ObjectId;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ enum: ["active", "ended"], default: "active" })
  status: string;

  createdAt: Date;
  updatedAt: Date;
}

export const VehicleAssignmentSchema = SchemaFactory.createForClass(VehicleAssignment);

VehicleAssignmentSchema.index({ instructorId: 1, status: 1 });
VehicleAssignmentSchema.index({ vehicleId: 1, status: 1 });
VehicleAssignmentSchema.index({ schoolId: 1 });

VehicleAssignmentSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
