import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type InstructorDocument = Instructor & Document;

// Sub-schema for service areas
export class ServiceArea {
  @Prop({ required: true })
  name: string;

  @Prop()
  postcode?: string;

  @Prop({ type: [Number] })
  coordinates?: number[]; // [lng, lat]

  @Prop({ default: 5 })
  radiusMiles?: number;
}

// Sub-schema for vehicle info
export class VehicleInfo {
  @Prop()
  make?: string;

  @Prop()
  model?: string;

  @Prop()
  year?: number;

  @Prop({ enum: ["manual", "automatic", "both"], default: "manual" })
  transmission?: string;

  @Prop()
  imageUrl?: string;
}

// Sub-schema for social links
export class SocialLinks {
  @Prop()
  website?: string;

  @Prop()
  facebook?: string;

  @Prop()
  instagram?: string;

  @Prop()
  twitter?: string;

  @Prop()
  youtube?: string;

  @Prop()
  tiktok?: string;
}

@Schema({ timestamps: true })
export class Instructor {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  businessName?: string;

  // === PUBLIC PROFILE FIELDS ===

  @Prop({
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/,
  })
  username?: string;

  @Prop({ maxlength: 500 })
  bio?: string;

  @Prop({ maxlength: 2000 })
  about?: string;

  @Prop()
  profileImage?: string;

  @Prop()
  coverImage?: string;

  @Prop({ type: [Object] })
  serviceAreas?: ServiceArea[];

  @Prop()
  primaryLocation?: string;

  @Prop({ type: Object })
  vehicleInfo?: VehicleInfo;

  @Prop({ type: Object })
  socialLinks?: SocialLinks;

  @Prop({ min: 0, max: 100 })
  passRate?: number;

  @Prop({ min: 0 })
  totalStudentsTaught?: number;

  @Prop({ min: 0 })
  yearsExperience?: number;

  @Prop({ type: [String] })
  qualifications?: string[];

  @Prop({ type: [String] })
  specializations?: string[];

  @Prop({ type: [String] })
  languages?: string[];

  @Prop({ default: false })
  isPublicProfileEnabled?: boolean;

  @Prop({ default: true })
  showPricing?: boolean;

  @Prop({ default: true })
  showAvailability?: boolean;

  @Prop({ default: true })
  acceptingNewStudents?: boolean;

  // === PRICING & PAYMENTS ===

  @Prop({ default: 45 })
  hourlyRate: number;

  @Prop({ default: "GBP" })
  currency: string;

  @Prop()
  stripeAccountId?: string;

  // === METADATA ===

  @Prop({ default: 0 })
  profileViews?: number;

  @Prop()
  lastActiveAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);

// Indexes
InstructorSchema.index({ email: 1 });
InstructorSchema.index({ username: 1 }, { unique: true, sparse: true });
InstructorSchema.index({ isPublicProfileEnabled: 1 });
InstructorSchema.index({ primaryLocation: "text", "serviceAreas.name": "text" });

// Virtual for full name
InstructorSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for public profile URL
InstructorSchema.virtual("publicProfileUrl").get(function () {
  if (this.username) {
    return `https://${this.username}.indrive.com`;
  }
  return null;
});

// Ensure virtuals are included in JSON output
InstructorSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});
