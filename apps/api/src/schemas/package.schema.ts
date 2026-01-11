import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PackageDocument = Package & Document;

@Schema({ timestamps: true })
export class Package {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 1 })
  lessonCount: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 0, min: 0, max: 100 })
  discountPercent: number;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const PackageSchema = SchemaFactory.createForClass(Package);

PackageSchema.index({ instructorId: 1, isActive: 1 });

PackageSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
