import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  Res,
  Header,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly configService: ConfigService,
  ) {}

  // ── Authenticated endpoints (learner JWT required) ──────────────────────

  /**
   * GET /calendar/feed-url
   * Returns the subscribable calendar feed URL for the authenticated learner.
   */
  @Get('feed-url')
  @UseGuards(JwtAuthGuard)
  async getFeedUrl(@Request() req: { user: { id: string } }) {
    const token = await this.calendarService.getOrCreateFeedToken(req.user.id);
    const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3000/api';
    const httpUrl = `${apiUrl}/calendar/feed/${token}`;
    const webcalUrl = httpUrl.replace(/^https?:\/\//, 'webcal://');

    return {
      feedToken: token,
      httpUrl,
      webcalUrl,
      googleCalendarUrl: `https://www.google.com/calendar/render?cid=${encodeURIComponent(httpUrl)}`,
    };
  }

  /**
   * POST /calendar/regenerate-token
   * Regenerates the calendar feed token (invalidates old subscription URLs).
   */
  @Post('regenerate-token')
  @UseGuards(JwtAuthGuard)
  async regenerateToken(@Request() req: { user: { id: string } }) {
    const token = await this.calendarService.regenerateFeedToken(req.user.id);
    const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3000/api';
    const httpUrl = `${apiUrl}/calendar/feed/${token}`;
    const webcalUrl = httpUrl.replace(/^https?:\/\//, 'webcal://');

    return {
      feedToken: token,
      httpUrl,
      webcalUrl,
      googleCalendarUrl: `https://www.google.com/calendar/render?cid=${encodeURIComponent(httpUrl)}`,
    };
  }

  /**
   * GET /calendar/lesson/:lessonId.ics
   * Downloads a single lesson as an .ics file (authenticated).
   */
  @Get('lesson/:lessonId.ics')
  @UseGuards(JwtAuthGuard)
  async downloadLessonIcs(
    @Request() req: { user: { id: string } },
    @Param('lessonId') lessonId: string,
    @Res() res: Response,
  ) {
    const ics = await this.calendarService.generateLessonIcs(req.user.id, lessonId);
    this.sendIcsResponse(res, ics, `lesson-${lessonId}.ics`);
  }

  /**
   * GET /calendar/test-date.ics
   * Downloads the test date as an .ics file (authenticated).
   */
  @Get('test-date.ics')
  @UseGuards(JwtAuthGuard)
  async downloadTestDateIcs(
    @Request() req: { user: { id: string } },
    @Res() res: Response,
  ) {
    const ics = await this.calendarService.generateTestDateIcs(req.user.id);
    if (!ics) {
      throw new NotFoundException('No test date set');
    }
    this.sendIcsResponse(res, ics, 'driving-test-date.ics');
  }

  // ── Public endpoint (token-authenticated, no JWT) ───────────────────────

  /**
   * GET /calendar/feed/:token
   * Subscribable calendar feed. Calendar apps poll this URL periodically.
   * No JWT required — authenticated via the unique feed token.
   */
  @Get('feed/:token')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async getCalendarFeed(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    const ics = await this.calendarService.generateCalendarFeed(token);
    this.sendIcsResponse(res, ics, 'driving-lessons.ics');
  }

  // ── Helper ──────────────────────────────────────────────────────────────

  private sendIcsResponse(res: Response, ics: string, filename: string) {
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(ics);
  }
}
