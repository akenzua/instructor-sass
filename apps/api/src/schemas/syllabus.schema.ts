import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type SyllabusDocument = Syllabus & Document;

export const TopicStatuses = ["not-started", "in-progress", "completed"] as const;
export const ScoreValues = [1, 2, 3, 4, 5] as const;

// ============================================================================
// Syllabus Topic (embedded in Syllabus)
// ============================================================================

@Schema({ _id: false })
export class SyllabusTopic {
  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  keySkills: string[];
}

// ============================================================================
// Syllabus (instructor's master template)
// ============================================================================

@Schema({ timestamps: true })
export class Syllabus {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: [SyllabusTopic], default: [] })
  topics: SyllabusTopic[];

  createdAt: Date;
  updatedAt: Date;
}

export const SyllabusSchema = SchemaFactory.createForClass(Syllabus);

SyllabusSchema.index({ instructorId: 1, isDefault: 1 });

SyllabusSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// ============================================================================
// Score History Entry (embedded in TopicProgress)
// ============================================================================

@Schema({ _id: false })
export class ScoreHistoryEntry {
  @Prop({ type: Types.ObjectId, ref: "Lesson" })
  lessonId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, min: 1, max: 5 })
  score: number;

  @Prop()
  notes?: string;
}

// ============================================================================
// Topic Progress (embedded in LearnerProgress)
// ============================================================================

@Schema({ _id: false })
export class TopicProgress {
  @Prop({ required: true })
  topicOrder: number;

  @Prop({ enum: TopicStatuses, default: "not-started" })
  status: string;

  @Prop({ min: 0, max: 5, default: 0 })
  currentScore: number;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ type: [ScoreHistoryEntry], default: [] })
  history: ScoreHistoryEntry[];

  @Prop()
  completedAt?: Date;
}

// ============================================================================
// Learner Progress (per learner × syllabus)
// ============================================================================

export type LearnerProgressDocument = LearnerProgress & Document;

@Schema({ timestamps: true })
export class LearnerProgress {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Learner", required: true, index: true })
  learnerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Syllabus", required: true })
  syllabusId: Types.ObjectId;

  @Prop({ type: [TopicProgress], default: [] })
  topicProgress: TopicProgress[];

  createdAt: Date;
  updatedAt: Date;
}

export const LearnerProgressSchema = SchemaFactory.createForClass(LearnerProgress);

LearnerProgressSchema.index({ learnerId: 1, syllabusId: 1 }, { unique: true });
LearnerProgressSchema.index({ instructorId: 1, learnerId: 1 });

LearnerProgressSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});
