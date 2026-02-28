import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  Notification,
  NotificationDocument,
} from "../../schemas/notification.schema";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private isProcessing = false;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
  ) {}

  // ============================================================================
  // Cron: Check for ended lessons every 2 minutes
  // ============================================================================

  @Cron(CronExpression.EVERY_MINUTE)
  async checkEndedLessons() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();

      // Find lessons that:
      // - are still "scheduled" (not yet completed/cancelled)
      // - have an endTime that has passed
      // - don't already have a notification
      const endedLessons = await this.lessonModel
        .find({
          status: "scheduled",
          endTime: { $lte: now },
        })
        .populate("learnerId", "firstName lastName")
        .lean();

      if (endedLessons.length === 0) {
        return;
      }

      // Check which lessons already have notifications
      const lessonIds = endedLessons.map((l) => l._id);
      const existingNotifications = await this.notificationModel
        .find({
          lessonId: { $in: lessonIds },
          type: "lesson_ended",
        })
        .lean();

      const notifiedLessonIds = new Set(
        existingNotifications.map((n) => n.lessonId?.toString()),
      );

      // Create notifications for lessons that don't have one yet
      const newNotifications = [];
      for (const lesson of endedLessons) {
        if (notifiedLessonIds.has(lesson._id.toString())) continue;

        const learner = lesson.learnerId as any;
        const learnerName = learner?.firstName
          ? `${learner.firstName} ${learner.lastName || ""}`.trim()
          : "a learner";
        const learnerId =
          typeof lesson.learnerId === "object" && lesson.learnerId._id
            ? lesson.learnerId._id.toString()
            : lesson.learnerId?.toString();

        newNotifications.push({
          instructorId: lesson.instructorId,
          type: "lesson_ended",
          title: "Lesson Ended – Score Learner",
          message: `Your lesson with ${learnerName} has ended. Tap to mark it complete and score their progress.`,
          link: `/learners/${learnerId}?complete=${lesson._id.toString()}`,
          lessonId: lesson._id,
          learnerId: lesson.learnerId,
          read: false,
        });
      }

      if (newNotifications.length > 0) {
        await this.notificationModel.insertMany(newNotifications);
        this.logger.log(
          `Created ${newNotifications.length} lesson-ended notification(s)`,
        );
      }
    } catch (error) {
      this.logger.error("Error checking ended lessons", error);
    } finally {
      this.isProcessing = false;
    }
  }

  // ============================================================================
  // CRUD
  // ============================================================================

  async getAll(
    instructorId: string,
    opts: { unreadOnly?: boolean; limit?: number } = {},
  ) {
    const filter: Record<string, unknown> = {
      instructorId: new Types.ObjectId(instructorId),
    };
    if (opts.unreadOnly) filter.read = false;

    return this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(opts.limit || 30)
      .lean();
  }

  async getUnreadCount(instructorId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      instructorId: new Types.ObjectId(instructorId),
      read: false,
    });
  }

  async markAsRead(instructorId: string, notificationId: string) {
    return this.notificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        instructorId: new Types.ObjectId(instructorId),
      },
      { read: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllRead(instructorId: string) {
    const result = await this.notificationModel.updateMany(
      {
        instructorId: new Types.ObjectId(instructorId),
        read: false,
      },
      { read: true, readAt: new Date() },
    );
    return { updated: result.modifiedCount };
  }
}
