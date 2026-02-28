import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: "Instructor", required: true, index: true })
  instructorId: Types.ObjectId;

  @Prop({ required: true })
  type: string; // 'lesson_ended' | 'reminder' | etc.

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  link?: string; // In-app link e.g. /learners/abc123?score=lessonId

  @Prop({ type: Types.ObjectId, ref: "Lesson" })
  lessonId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Learner" })
  learnerId?: Types.ObjectId;

  @Prop({ default: false, index: true })
  read: boolean;

  @Prop()
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Compound index for efficient queries
NotificationSchema.index({ instructorId: 1, read: 1, createdAt: -1 });
