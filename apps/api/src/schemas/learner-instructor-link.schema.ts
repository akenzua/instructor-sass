import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type LearnerInstructorLinkDocument = LearnerInstructorLink & Document;

@Schema({ timestamps: true })
export class LearnerInstructorLink {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Learner", required: true, index: true })
  learnerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  /** Per-instructor balance (prepaid credit with this instructor) */
  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: 0 })
  totalLessons: number;

  @Prop({ default: 0 })
  completedLessons: number;

  @Prop({ default: 0 })
  cancelledLessons: number;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ type: String, enum: ["active", "paused", "ended"], default: "active" })
  status: string;

  /** Notes from the instructor about this learner */
  @Prop()
  instructorNotes?: string;

  /** Learner's preferred pickup location for this instructor */
  @Prop()
  defaultPickupLocation?: string;

  /** When the relationship started (first booking) */
  @Prop()
  startedAt?: Date;

  /** When the last lesson was */
  @Prop()
  lastLessonAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const LearnerInstructorLinkSchema =
  SchemaFactory.createForClass(LearnerInstructorLink);

// One link per learner+instructor pair
LearnerInstructorLinkSchema.index(
  { learnerId: 1, instructorId: 1 },
  { unique: true },
);

// For instructor lookups: "show me all my learners"
LearnerInstructorLinkSchema.index({ instructorId: 1, status: 1 });

// For learner lookups: "show me all my instructors"
LearnerInstructorLinkSchema.index({ learnerId: 1, status: 1 });

LearnerInstructorLinkSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
