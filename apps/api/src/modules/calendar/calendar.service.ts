import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from '../../schemas/lesson.schema';
import { Learner, LearnerDocument } from '../../schemas/learner.schema';
import { Instructor } from '../../schemas/instructor.schema';
import * as crypto from 'crypto';

/**
 * Generates iCalendar (.ics) content for learner lessons and test dates.
 *
 * Supports:
 * - Single-event .ics download (for "Add to Calendar" buttons)
 * - Full calendar feed (subscribable webcal:// URL)
 */
@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Learner.name) private learnerModel: Model<LearnerDocument>,
    @InjectModel(Instructor.name) private instructorModel: Model<any>,
  ) {}

  /**
   * Generate or retrieve the calendar feed token for a learner.
   * This token is used to authenticate the subscribable calendar URL
   * without requiring a JWT (calendar apps can't do OAuth).
   */
  async getOrCreateFeedToken(learnerId: string): Promise<string> {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    if (learner.calendarFeedToken) {
      return learner.calendarFeedToken;
    }

    const token = crypto.randomBytes(32).toString('hex');
    await this.learnerModel.findByIdAndUpdate(learnerId, {
      $set: { calendarFeedToken: token },
    });

    return token;
  }

  /**
   * Regenerate the feed token (invalidates old subscription URLs).
   */
  async regenerateFeedToken(learnerId: string): Promise<string> {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    await this.learnerModel.findByIdAndUpdate(learnerId, {
      $set: { calendarFeedToken: token },
    });

    return token;
  }

  /**
   * Generate a single-event .ics file for a specific lesson.
   */
  async generateLessonIcs(learnerId: string, lessonId: string): Promise<string> {
    const lesson = await this.lessonModel.findOne({
      _id: new Types.ObjectId(lessonId),
      learnerId: new Types.ObjectId(learnerId),
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const instructor = await this.instructorModel.findById(lesson.instructorId);
    const instructorName = instructor
      ? `${instructor.firstName} ${instructor.lastName}`
      : 'Your Instructor';

    return this.buildIcsFile([
      this.buildLessonEvent(lesson, instructorName),
    ]);
  }

  /**
   * Generate a full calendar feed (.ics) for all upcoming lessons + test date.
   * Used for subscribable webcal:// URLs.
   */
  async generateCalendarFeed(feedToken: string): Promise<string> {
    const learner = await this.learnerModel.findOne({ calendarFeedToken: feedToken });
    if (!learner) {
      throw new NotFoundException('Invalid calendar feed token');
    }

    // Fetch all non-cancelled future lessons
    const lessons = await this.lessonModel.find({
      learnerId: learner._id,
      status: { $in: ['scheduled', 'pending-confirmation'] },
      startTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Include lessons from past week
    }).sort({ startTime: 1 });

    // Gather instructor IDs and fetch them
    const instructorIds = [...new Set(lessons.map((l) => l.instructorId.toString()))];
    const instructors = await this.instructorModel.find({
      _id: { $in: instructorIds.map((id) => new Types.ObjectId(id)) },
    });
    const instructorMap = new Map(
      instructors.map((i) => [i._id.toString(), `${i.firstName} ${i.lastName}`]),
    );

    const events: string[] = [];

    // Add lesson events
    for (const lesson of lessons) {
      const instructorName = instructorMap.get(lesson.instructorId.toString()) || 'Your Instructor';
      events.push(this.buildLessonEvent(lesson, instructorName));
    }

    // Add test date event if set
    if (learner.testDate) {
      events.push(this.buildTestDateEvent(learner));
    }

    return this.buildIcsFile(events);
  }

  /**
   * Generate a .ics for just the test date.
   */
  async generateTestDateIcs(learnerId: string): Promise<string | null> {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner || !learner.testDate) {
      return null;
    }

    return this.buildIcsFile([this.buildTestDateEvent(learner)]);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private buildLessonEvent(lesson: LessonDocument, instructorName: string): string {
    const uid = `lesson-${lesson._id}@drivinglessons.app`;
    const now = this.formatIcsDate(new Date());
    const start = this.formatIcsDate(lesson.startTime);
    const end = this.formatIcsDate(lesson.endTime);

    const typeLabel = this.formatLessonType(lesson.type);
    const summary = `${typeLabel} - ${instructorName}`;

    const descriptionParts = [
      `${typeLabel} with ${instructorName}`,
      `Duration: ${lesson.duration} minutes`,
    ];
    if (lesson.pickupLocation) {
      descriptionParts.push(`Pickup: ${lesson.pickupLocation}`);
    }
    if (lesson.notes) {
      descriptionParts.push(`Notes: ${lesson.notes}`);
    }

    const description = descriptionParts.join('\\n');
    const location = lesson.pickupLocation || '';

    const lines = [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${this.escapeIcsText(summary)}`,
      `DESCRIPTION:${this.escapeIcsText(description)}`,
    ];

    if (location) {
      lines.push(`LOCATION:${this.escapeIcsText(location)}`);
    }

    // Add a 1-hour reminder
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${this.escapeIcsText(summary)} in 1 hour`,
      'END:VALARM',
    );

    // Add a 24-hour reminder
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${this.escapeIcsText(summary)} tomorrow`,
      'END:VALARM',
    );

    lines.push('END:VEVENT');
    return lines.join('\r\n');
  }

  private buildTestDateEvent(learner: LearnerDocument): string {
    const testDate = new Date(learner.testDate!);
    const uid = `test-date-${learner._id}@drivinglessons.app`;
    const now = this.formatIcsDate(new Date());
    const dateStr = testDate.toISOString().slice(0, 10).replace(/-/g, '');

    const learnerName = learner.firstName
      ? `${learner.firstName}'s`
      : 'Your';

    const lines = [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:${this.escapeIcsText(`🚗 ${learnerName} Driving Test`)}`,
      `DESCRIPTION:${this.escapeIcsText('Good luck on your driving test! Remember to bring your provisional licence and any required documents.')}`,
    ];

    // Add a 1-week reminder
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Your driving test is in 1 week!',
      'END:VALARM',
    );

    // Add a 1-day reminder
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Your driving test is tomorrow! Get a good night\'s sleep.',
      'END:VALARM',
    );

    lines.push('END:VEVENT');
    return lines.join('\r\n');
  }

  private buildIcsFile(events: string[]): string {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Driving Lessons App//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:My Driving Lessons',
      'X-WR-TIMEZONE:Europe/London',
      // Timezone definition for UK
      'BEGIN:VTIMEZONE',
      'TZID:Europe/London',
      'BEGIN:STANDARD',
      'DTSTART:19701025T020000',
      'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0000',
      'TZNAME:GMT',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:19700329T010000',
      'RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3',
      'TZOFFSETFROM:+0000',
      'TZOFFSETTO:+0100',
      'TZNAME:BST',
      'END:DAYLIGHT',
      'END:VTIMEZONE',
      ...events,
      'END:VCALENDAR',
    ];
    return lines.join('\r\n');
  }

  private formatIcsDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private formatLessonType(type: string): string {
    const labels: Record<string, string> = {
      standard: 'Driving Lesson',
      'test-prep': 'Test Preparation Lesson',
      'mock-test': 'Mock Driving Test',
      motorway: 'Motorway Lesson',
      refresher: 'Refresher Lesson',
    };
    return labels[type] || 'Driving Lesson';
  }

  private escapeIcsText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }
}
