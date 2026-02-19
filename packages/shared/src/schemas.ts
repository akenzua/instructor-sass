import { z } from "zod";

// ============================================================================
// Common Types
// ============================================================================

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

// ============================================================================
// Instructor
// ============================================================================

// Sub-schemas
export const serviceAreaSchema = z.object({
  name: z.string(),
  postcode: z.string().optional(),
  coordinates: z.array(z.number()).length(2).optional(), // [lng, lat]
  radiusMiles: z.number().default(5),
});

export const vehicleInfoSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  transmission: z.enum(["manual", "automatic", "both"]).default("manual"),
  imageUrl: z.string().optional(),
});

export const socialLinksSchema = z.object({
  website: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  tiktok: z.string().optional(),
});

export const lessonTypeConfigSchema = z.object({
  type: z.string(),
  price: z.number().positive(),
  duration: z.number().int().positive().default(60),
  description: z.string().optional(),
});

export const instructorSchema = z.object({
  _id: objectIdSchema,
  email: z.string().email(),
  password: z.string().min(8).optional(), // Optional when returning from API
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  
  // Public profile fields
  username: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/).optional(),
  bio: z.string().max(500).optional(),
  about: z.string().max(2000).optional(),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
  serviceAreas: z.array(serviceAreaSchema).optional(),
  primaryLocation: z.string().optional(),
  vehicleInfo: vehicleInfoSchema.optional(),
  socialLinks: socialLinksSchema.optional(),
  passRate: z.number().min(0).max(100).optional(),
  totalStudentsTaught: z.number().min(0).optional(),
  yearsExperience: z.number().min(0).optional(),
  qualifications: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  isPublicProfileEnabled: z.boolean().default(false),
  showPricing: z.boolean().default(true),
  showAvailability: z.boolean().default(true),
  acceptingNewStudents: z.boolean().default(true),
  
  // Pricing & payments
  hourlyRate: z.number().positive().default(45),
  lessonTypes: z.array(lessonTypeConfigSchema).default([]),
  currency: z.string().default("GBP"),
  cancellationPolicy: cancellationPolicySchema.optional(),
  stripeAccountId: z.string().optional(),
  
  // Metadata
  profileViews: z.number().default(0),
  lastActiveAt: z.string().datetime().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createInstructorSchema = instructorSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  stripeAccountId: true,
  profileViews: true,
  lastActiveAt: true,
}).extend({
  password: z.string().min(8),
});

export const updateInstructorSchema = createInstructorSchema.partial().omit({ password: true });

export type ServiceArea = z.infer<typeof serviceAreaSchema>;
export type VehicleInfo = z.infer<typeof vehicleInfoSchema>;
export type SocialLinks = z.infer<typeof socialLinksSchema>;
// Cancellation Policy sub-schema
export const cancellationPolicySchema = z.object({
  freeCancellationWindowHours: z.number().min(0).default(48),
  lateCancellationWindowHours: z.number().min(0).default(24),
  lateCancellationChargePercent: z.number().min(0).max(100).default(50),
  veryLateCancellationChargePercent: z.number().min(0).max(100).default(100),
  noShowChargePercent: z.number().min(0).max(100).default(100),
  allowLearnerCancellation: z.boolean().default(true),
  policyText: z.string().max(1000).optional(),
});

export type CancellationPolicy = z.infer<typeof cancellationPolicySchema>;
export type LessonTypeConfig = z.infer<typeof lessonTypeConfigSchema>;
export type Instructor = z.infer<typeof instructorSchema>;
export type CreateInstructor = z.infer<typeof createInstructorSchema>;
export type UpdateInstructor = z.infer<typeof updateInstructorSchema>;

// ============================================================================
// Learner
// ============================================================================

export const learnerStatusSchema = z.enum(["active", "inactive", "archived"]);

export const learnerSchema = z.object({
  _id: objectIdSchema,
  instructorId: objectIdSchema,
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
  }).optional(),
  licenseNumber: z.string().optional(),
  testDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  status: learnerStatusSchema.default("active"),
  balance: z.number().default(0), // Negative = owes money
  totalLessons: z.number().int().default(0),
  completedLessons: z.number().int().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createLearnerSchema = learnerSchema.omit({
  _id: true,
  instructorId: true,
  balance: true,
  totalLessons: true,
  completedLessons: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLearnerSchema = createLearnerSchema.partial();

export type LearnerStatus = z.infer<typeof learnerStatusSchema>;
export type Learner = z.infer<typeof learnerSchema>;
export type CreateLearner = z.infer<typeof createLearnerSchema>;
export type UpdateLearner = z.infer<typeof updateLearnerSchema>;

// ============================================================================
// Lesson
// ============================================================================

export const lessonStatusSchema = z.enum([
  "scheduled",
  "completed",
  "cancelled",
  "no-show",
]);

export const lessonPaymentStatusSchema = z.enum([
  "pending",
  "paid",
  "refunded",
  "waived",
]);

export const lessonTypeSchema = z.enum([
  "standard",
  "test-prep",
  "mock-test",
  "motorway",
  "refresher",
]);

export const lessonSchema = z.object({
  _id: objectIdSchema,
  instructorId: objectIdSchema,
  learnerId: objectIdSchema,
  learner: learnerSchema.pick({ 
    _id: true, 
    firstName: true, 
    lastName: true, 
    email: true,
    phone: true,
  }).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.number().int().min(30).max(180), // minutes
  type: lessonTypeSchema.default("standard"),
  status: lessonStatusSchema.default("scheduled"),
  paymentStatus: lessonPaymentStatusSchema.default("pending"),
  price: z.number().nonnegative(),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  notes: z.string().optional(),
  instructorNotes: z.string().optional(), // Private notes
  cancellationReason: z.string().optional(),
  cancelledBy: z.enum(["instructor", "learner", "system"]).optional(),
  cancellationFee: z.number().nonnegative().optional(),
  cancellationRefundAmount: z.number().nonnegative().optional(),
  cancelledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createLessonSchema = lessonSchema.omit({
  _id: true,
  instructorId: true,
  learner: true,
  status: true,
  paymentStatus: true,
  cancelledBy: true,
  cancellationFee: true,
  cancellationRefundAmount: true,
  cancelledAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLessonSchema = createLessonSchema.partial();

export const lessonQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  learnerId: objectIdSchema.optional(),
  status: lessonStatusSchema.optional(),
  paymentStatus: lessonPaymentStatusSchema.optional(),
}).merge(paginationSchema.partial());

export type LessonStatus = z.infer<typeof lessonStatusSchema>;
export type LessonPaymentStatus = z.infer<typeof lessonPaymentStatusSchema>;
export type LessonType = z.infer<typeof lessonTypeSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type CreateLesson = z.infer<typeof createLessonSchema>;
export type UpdateLesson = z.infer<typeof updateLessonSchema>;
export type LessonQuery = z.infer<typeof lessonQuerySchema>;

// ============================================================================
// Availability
// ============================================================================

export const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const timeSlotSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
});

export const weeklyAvailabilitySchema = z.object({
  _id: objectIdSchema,
  instructorId: objectIdSchema,
  dayOfWeek: dayOfWeekSchema,
  slots: z.array(timeSlotSchema),
  isAvailable: z.boolean().default(true),
});

export const availabilityOverrideSchema = z.object({
  _id: objectIdSchema,
  instructorId: objectIdSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  slots: z.array(timeSlotSchema).optional(), // Empty = not available
  isAvailable: z.boolean(),
  reason: z.string().optional(),
});

export const createAvailabilityOverrideSchema = availabilityOverrideSchema.omit({
  _id: true,
  instructorId: true,
});

export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;
export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type WeeklyAvailability = z.infer<typeof weeklyAvailabilitySchema>;
export type AvailabilityOverride = z.infer<typeof availabilityOverrideSchema>;
export type CreateAvailabilityOverride = z.infer<typeof createAvailabilityOverrideSchema>;

// ============================================================================
// Package (Lesson Bundles)
// ============================================================================

export const packageSchema = z.object({
  _id: objectIdSchema,
  instructorId: objectIdSchema,
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  lessonCount: z.number().int().positive(),
  price: z.number().positive(),
  discountPercent: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createPackageSchema = packageSchema.omit({
  _id: true,
  instructorId: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePackageSchema = createPackageSchema.partial();

export type Package = z.infer<typeof packageSchema>;
export type CreatePackage = z.infer<typeof createPackageSchema>;
export type UpdatePackage = z.infer<typeof updatePackageSchema>;

// ============================================================================
// Payment
// ============================================================================

export const paymentStatusSchema = z.enum([
  "pending",
  "processing",
  "succeeded",
  "failed",
  "refunded",
  "cancelled",
]);

export const paymentMethodSchema = z.enum([
  "card",
  "cash",
  "bank_transfer",
  "balance",
]);

export const paymentTypeSchema = z.enum([
  "top-up",
  "lesson-booking",
  "package-booking",
  "cancellation-fee",
  "refund",
]);

export const paymentSchema = z.object({
  _id: objectIdSchema,
  type: paymentTypeSchema.default("top-up"),
  instructorId: objectIdSchema,
  learnerId: objectIdSchema,
  learner: learnerSchema.pick({ firstName: true, lastName: true, email: true }).optional(),
  lessonIds: z.array(objectIdSchema).default([]),
  packageId: objectIdSchema.optional(),
  amount: z.number().positive(),
  currency: z.string().default("GBP"),
  status: paymentStatusSchema.default("pending"),
  method: paymentMethodSchema.default("card"),
  stripePaymentIntentId: z.string().optional(),
  stripeClientSecret: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  paidAt: z.string().datetime().optional(),
  refundedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createPaymentIntentSchema = z.object({
  learnerId: objectIdSchema,
  lessonIds: z.array(objectIdSchema).optional(),
  packageId: objectIdSchema.optional(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentType = z.infer<typeof paymentTypeSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type CreatePaymentIntent = z.infer<typeof createPaymentIntentSchema>;

// ============================================================================
// Auth
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signupSchema = createInstructorSchema;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  instructor: instructorSchema.omit({ password: true }),
});

export const magicLinkRequestSchema = z.object({
  email: z.string().email(),
});

export const magicLinkVerifySchema = z.object({
  token: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;
export type MagicLinkVerify = z.infer<typeof magicLinkVerifySchema>;

// ============================================================================
// API Responses
// ============================================================================

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  error: z.string().optional(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  });

export type ApiError = z.infer<typeof apiErrorSchema>;
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================================================
// Dashboard Stats
// ============================================================================

export const dashboardStatsSchema = z.object({
  todayLessons: z.number(),
  weekLessons: z.number(),
  unpaidLessons: z.number(),
  unpaidAmount: z.number(),
  activeLearners: z.number(),
  monthlyEarnings: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
