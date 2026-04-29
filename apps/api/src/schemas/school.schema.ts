import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { CancellationPolicyConfig, LessonTypeConfig } from "./instructor.schema";

export type SchoolDocument = School & Document;

@Schema({ _id: false })
export class SchoolAddress {
  @Prop()
  line1?: string;

  @Prop()
  line2?: string;

  @Prop()
  city?: string;

  @Prop()
  postcode?: string;
}

@Schema({ _id: false })
export class SchoolSettings {
  @Prop({ default: 45 })
  defaultHourlyRate?: number;

  @Prop({ default: "GBP" })
  defaultCurrency?: string;
}

@Schema({ timestamps: true })
export class School {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: SchoolAddress })
  address?: SchoolAddress;

  @Prop()
  logo?: string;

  @Prop({ trim: true })
  businessRegistrationNumber?: string;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ type: SchoolSettings, default: () => ({}) })
  settings?: SchoolSettings;

  @Prop({ type: CancellationPolicyConfig })
  cancellationPolicy?: CancellationPolicyConfig;

  @Prop({ type: [LessonTypeConfig], default: [] })
  lessonTypes: LessonTypeConfig[];

  @Prop({ enum: ["active", "suspended"], default: "active" })
  status: string;

  createdAt: Date;
  updatedAt: Date;
}

export const SchoolSchema = SchemaFactory.createForClass(School);

SchoolSchema.index({ ownerId: 1 });

SchoolSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
