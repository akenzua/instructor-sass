import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type InstructorDocument = Instructor & Document;

// GeoJSON Point for MongoDB geospatial queries
export class GeoPoint {
  @Prop({ default: "Point" })
  type: string;

  @Prop({ type: [Number], required: true })
  coordinates: number[]; // [longitude, latitude]
}

// Sub-schema for service areas
export class ServiceArea {
  @Prop({ required: true })
  name: string;

  @Prop()
  postcode?: string;

  @Prop({ type: [Number] })
  coordinates?: number[]; // [lng, lat] - legacy format

  @Prop({ type: GeoPoint })
  location?: GeoPoint; // GeoJSON format for 2dsphere queries

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

// Sub-schema for lesson types
export class LessonTypeConfig {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 60 })
  duration: number;

  @Prop()
  description?: string;
}

// Sub-schema for cancellation policy
export class CancellationPolicyConfig {
  @Prop({ default: 48 })
  freeCancellationWindowHours: number;

  @Prop({ default: 24 })
  lateCancellationWindowHours: number;

  @Prop({ default: 50 })
  lateCancellationChargePercent: number;

  @Prop({ default: 100 })
  veryLateCancellationChargePercent: number;

  @Prop({ default: 100 })
  noShowChargePercent: number;

  @Prop({ default: true })
  allowLearnerCancellation: boolean;

  @Prop()
  policyText?: string;
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

  @Prop({ type: [Object], default: [] })
  lessonTypes?: LessonTypeConfig[];

  @Prop({ default: "GBP" })
  currency: string;

  @Prop({ type: Object })
  cancellationPolicy?: CancellationPolicyConfig;

  @Prop()
  stripeAccountId?: string;

  // === METADATA ===

  @Prop({ default: 0 })
  profileViews?: number;

  @Prop()
  lastActiveAt?: Date;

  // === GEOLOCATION ===
  // Primary location as GeoJSON for geospatial queries
  @Prop({ type: Object })
  geoLocation?: GeoPoint;

  createdAt: Date;
  updatedAt: Date;
}

export const InstructorSchema = SchemaFactory.createForClass(Instructor);

// Indexes
InstructorSchema.index({ email: 1 });
InstructorSchema.index({ username: 1 }, { unique: true, sparse: true });
InstructorSchema.index({ isPublicProfileEnabled: 1 });
InstructorSchema.index({ primaryLocation: "text", "serviceAreas.name": "text" });
// Geospatial index for location-based search
InstructorSchema.index({ geoLocation: "2dsphere" });

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
