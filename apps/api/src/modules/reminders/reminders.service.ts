import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Lesson, LessonDocument } from '../../schemas/lesson.schema';
import { EmailService } from '../email/email.service';

interface ReminderWindow {
  field: 'fortyEightHour' | 'twentyFourHour' | 'oneHour';
  hoursBeforeLesson: number;
  label: string;
  shortLabel: '48h' | '24h' | '1h';
}

const REMINDER_WINDOWS: ReminderWindow[] = [
  { field: 'fortyEightHour', hoursBeforeLesson: 48, label: '48 hours', shortLabel: '48h' },
  { field: 'twentyFourHour', hoursBeforeLesson: 24, label: '24 hours', shortLabel: '24h' },
  { field: 'oneHour', hoursBeforeLesson: 1, label: '1 hour', shortLabel: '1h' },
];

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);
  private isProcessing = false;

  constructor(
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Runs every 5 minutes. Finds lessons needing reminders and sends them.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleReminders() {
    if (this.isProcessing) {
      this.logger.debug('Reminder job already running, skipping');
      return;
    }

    this.isProcessing = true;

    try {
      for (const window of REMINDER_WINDOWS) {
        await this.processReminderWindow(window);
      }
    } catch (error) {
      this.logger.error('Error processing reminders', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processReminderWindow(window: ReminderWindow) {
    const now = new Date();
    const windowEnd = new Date(
      now.getTime() + window.hoursBeforeLesson * 60 * 60 * 1000,
    );
    // 6-minute buffer so we don't miss lessons between cron runs
    const windowEndWithBuffer = new Date(windowEnd.getTime() + 6 * 60 * 1000);

    const reminderField = `remindersSent.${window.field}`;

    // Find lessons that are scheduled, start within this window, and haven't been reminded
    const lessons = await this.lessonModel
      .find({
        status: 'scheduled',
        startTime: { $gte: now, $lte: windowEndWithBuffer },
        [reminderField]: { $ne: true },
      })
      .populate('learnerId', 'firstName lastName email')
      .populate('instructorId', 'firstName lastName email phone cancellationPolicy')
      .limit(500)
      .lean();

    if (lessons.length === 0) return;

    this.logger.log(
      `Found ${lessons.length} lessons needing ${window.shortLabel} reminder`,
    );

    let sent = 0;
    let failed = 0;

    for (const lesson of lessons) {
      try {
        const learner = lesson.learnerId as any;
        const instructor = lesson.instructorId as any;

        if (!learner?.email) {
          this.logger.warn(`Lesson ${lesson._id} has no learner email, skipping`);
          continue;
        }

        const lessonDate = new Date(lesson.startTime);
        const formattedDate = lessonDate.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const formattedTime = lessonDate.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const instructorName = instructor
          ? `${instructor.firstName} ${instructor.lastName}`
          : 'Your Instructor';
        const instructorPhone = instructor?.phone || null;

        const cancellationPolicy = instructor?.cancellationPolicy || null;

        await this.sendReminderEmail({
          to: learner.email,
          learnerName: learner.firstName || 'there',
          instructorName,
          instructorPhone,
          date: formattedDate,
          time: formattedTime,
          duration: lesson.duration || 60,
          reminderType: window.shortLabel,
          reminderLabel: window.label,
          pickupLocation: lesson.pickupLocation || null,
          lessonType: lesson.type || 'standard',
          cancellationPolicy,
        });

        // Atomically mark reminder as sent (prevents duplicates)
        await this.lessonModel.findOneAndUpdate(
          { _id: lesson._id, [reminderField]: { $ne: true } },
          { $set: { [reminderField]: true } },
        );

        sent++;
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to send ${window.shortLabel} reminder for lesson ${lesson._id}`,
          error,
        );
      }
    }

    if (sent > 0 || failed > 0) {
      this.logger.log(`${window.shortLabel} reminders: ${sent} sent, ${failed} failed`);
    }
  }

  private buildCancellationPolicyText(policy: any | null): string {
    if (!policy) {
      return 'Cancellations within 24 hours of the lesson may incur a fee.';
    }

    if (policy.policyText) {
      return policy.policyText;
    }

    const parts: string[] = [];
    const freeWindow = policy.freeCancellationWindowHours ?? 48;
    const lateWindow = policy.lateCancellationWindowHours ?? 24;
    const lateCharge = policy.lateCancellationChargePercent ?? 50;
    const veryLateCharge = policy.veryLateCancellationChargePercent ?? 100;
    const noShowCharge = policy.noShowChargePercent ?? 100;

    parts.push(`Free cancellation up to ${freeWindow} hours before the lesson.`);

    if (lateCharge > 0) {
      parts.push(
        `Cancelling between ${freeWindow} and ${lateWindow} hours before the lesson will incur a ${lateCharge}% charge.`,
      );
    }

    if (veryLateCharge > 0) {
      parts.push(
        `Cancelling less than ${lateWindow} hours before the lesson will incur a ${veryLateCharge}% charge.`,
      );
    }

    if (noShowCharge > 0) {
      parts.push(`No-shows are charged at ${noShowCharge}%.`);
    }

    return parts.join(' ');
  }

  private buildCancellationTipText(policy: any | null): string {
    const freeWindow = policy?.freeCancellationWindowHours ?? 48;
    return `If you need to change this lesson, please do so at least ${freeWindow} hours in advance to avoid a cancellation fee.`;
  }

  private async sendReminderEmail(params: {
    to: string;
    learnerName: string;
    instructorName: string;
    instructorPhone: string | null;
    date: string;
    time: string;
    duration: number;
    reminderType: '48h' | '24h' | '1h';
    reminderLabel: string;
    pickupLocation: string | null;
    lessonType: string;
    cancellationPolicy: any | null;
  }): Promise<void> {
    const urgencyColor =
      params.reminderType === '1h'
        ? '#e53e3e'
        : params.reminderType === '24h'
          ? '#dd6b20'
          : '#3182ce';

    const urgencyGradientEnd =
      params.reminderType === '1h'
        ? '#c53030'
        : params.reminderType === '24h'
          ? '#c05621'
          : '#2b6cb0';

    const urgencyText =
      params.reminderType === '1h'
        ? '⏰ Starting Very Soon!'
        : params.reminderType === '24h'
          ? '📅 Tomorrow'
          : '📋 Coming Up';

    const subject =
      params.reminderType === '1h'
        ? `⏰ Your lesson starts in 1 hour!`
        : params.reminderType === '24h'
          ? `📅 Lesson reminder — tomorrow at ${params.time}`
          : `📋 Lesson reminder — ${params.date} at ${params.time}`;

    const typeLabels: Record<string, string> = {
      standard: 'Standard',
      'test-prep': 'Test Preparation',
      'mock-test': 'Mock Test',
      motorway: 'Motorway',
      refresher: 'Refresher',
    };

    let tipsBlock = '';
    if (params.reminderType === '1h') {
      tipsBlock = `
        <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #c53030; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Before your lesson:</p>
          <ul style="color: #742a2a; font-size: 13px; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 4px;">Have your provisional licence ready</li>
            <li style="margin-bottom: 4px;">Wear comfortable shoes suitable for driving</li>
            <li style="margin-bottom: 4px;">Make sure you've had something to eat</li>
            <li>Be at the pickup location 5 minutes early</li>
          </ul>
        </div>`;
    } else if (params.reminderType === '24h') {
      tipsBlock = `
        <div style="background: #fffaf0; border: 1px solid #feebc8; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #c05621; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Reminder:</p>
          <p style="color: #7b341e; font-size: 13px; margin: 0;">
            Get a good night's sleep and ensure you have your provisional driving licence ready for tomorrow's lesson.
          </p>
        </div>`;
    } else {
      tipsBlock = `
        <div style="background: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #2b6cb0; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Need to reschedule?</p>
          <p style="color: #2a4365; font-size: 13px; margin: 0;">
            ${this.buildCancellationTipText(params.cancellationPolicy)}
          </p>
        </div>`;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyGradientEnd} 100%); color: white; text-align: center; padding: 20px; border-radius: 12px 12px 0 0; font-size: 20px; font-weight: 600;">
      ${urgencyText}
    </div>
    <div style="background: white; border-radius: 0 0 12px 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <p style="color: #2d3748; font-size: 16px; margin: 0 0 8px 0;">
        Hi ${params.learnerName},
      </p>
      <p style="color: #4a5568; font-size: 15px; margin: 0 0 24px 0;">
        Your driving lesson is in <strong>${params.reminderLabel}</strong>. Here are the details:
      </p>
      <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096; font-size: 14px; width: 40%;">📅 Date</td>
            <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600;">${params.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096; font-size: 14px;">⏰ Time</td>
            <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600;">${params.time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096; font-size: 14px;">⏱️ Duration</td>
            <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600;">${params.duration} minutes</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096; font-size: 14px;">🚗 Instructor</td>
            <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600;">${params.instructorName}</td>
          </tr>
          ${params.instructorPhone ? `<tr>
            <td style="padding: 8px 0; color: #718096; font-size: 14px;">📱 Phone</td>
            <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
              <a href="tel:${params.instructorPhone}" style="color: #3182ce; text-decoration: none;">${params.instructorPhone}</a>
            </td>
          </tr>` : ''}
          ${params.pickupLocation ? `<tr>
            <td style="padding: 8px 0; color: #718096; font-size: 14px;">📍 Pickup</td>
            <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600;">${params.pickupLocation}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; color: #718096; font-size: 14px;">🔧 Type</td>
            <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600;">${typeLabels[params.lessonType] || params.lessonType}</td>
          </tr>
        </table>
      </div>
      ${tipsBlock}
      <div style="background: #faf5ff; border: 1px solid #e9d8fd; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="color: #6b46c1; font-size: 13px; font-weight: 600; margin: 0 0 6px 0;">📜 Cancellation Policy</p>
        <p style="color: #553c9a; font-size: 12px; margin: 0; line-height: 1.5;">
          ${this.buildCancellationPolicyText(params.cancellationPolicy)}
        </p>
      </div>
    </div>
    <div style="text-align: center; padding: 24px; color: #a0aec0; font-size: 12px;">
      <p style="margin: 0;">You received this because you have an upcoming driving lesson.</p>
    </div>
  </div>
</body>
</html>`;

    await this.emailService.sendRawEmail(params.to, subject, html);
  }

  /**
   * Reset reminders when a lesson is rescheduled.
   * Call from any service that changes lesson startTime.
   */
  async resetReminders(lessonId: string): Promise<void> {
    await this.lessonModel.findByIdAndUpdate(lessonId, {
      $set: {
        'remindersSent.fortyEightHour': false,
        'remindersSent.twentyFourHour': false,
        'remindersSent.oneHour': false,
      },
    });
    this.logger.log(`Reset reminders for lesson ${lessonId}`);
  }
}
