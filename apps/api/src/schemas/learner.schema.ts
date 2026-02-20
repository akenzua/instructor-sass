import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type LearnerDocument = Learner & Document;

@Schema({ _id: false })
export class Address {
  @Prop()
  line1?: string;

  @Prop()
  line2?: string;

  @Prop()
  city?: string;

  @Prop()
  postcode?: string;
}

@Schema({ timestamps: true })
export class Learner {
  _id: Types.ObjectId;

  // Optional for self-signup learners (not linked to instructor initially)
  @Prop({ type: Types.ObjectId, ref: "Instructor", index: true })
  instructorId?: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true, unique: true })
  email: string;

  // Optional during magic link signup, learner sets these after first login
  @Prop({ trim: true })
  firstName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  dateOfBirth?: string;

  @Prop({ type: Address })
  address?: Address;

  @Prop({ trim: true })
  licenseNumber?: string;

  @Prop({ default: false })
  licenceVerified: boolean;

  @Prop()
  licenceVerifiedAt?: Date;

  @Prop({ enum: ['pending', 'verified', 'failed', 'skipped', 'format_valid'], default: 'pending' })
  licenceStatus: string;

  @Prop()
  licenceVerificationError?: string;

  @Prop()
  testDate?: Date;

  @Prop()
  notes?: string;

  @Prop({ enum: ["active", "inactive", "archived"], default: "active" })
  status: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  totalLessons: number;

  @Prop({ default: 0 })
  completedLessons: number;

  createdAt: Date;
  updatedAt: Date;
}

export const LearnerSchema = SchemaFactory.createForClass(Learner);

// Indexes
LearnerSchema.index({ instructorId: 1, email: 1 }, { unique: true });
LearnerSchema.index({ instructorId: 1, status: 1 });

// Virtual for full name
LearnerSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

LearnerSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
