import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Header,
  Query,
} from "@nestjs/common";
import { LearnersBookingService } from "./learners-booking.service";
import { BookLessonDto, BookPackageDto } from "./dto/booking.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("learners/me/booking")
@UseGuards(JwtAuthGuard)
export class LearnersBookingController {
  constructor(
    private readonly bookingService: LearnersBookingService,
  ) {}

  /** List all instructors the learner is linked to */
  @Get("instructors")
  @Header("Cache-Control", "no-cache, no-store, must-revalidate")
  async getMyInstructors(
    @Request() req: { user: { id: string } },
  ) {
    return this.bookingService.getMyInstructors(req.user.id);
  }

  /** Get instructor info + availability, optionally for a specific instructor */
  @Get("availability")
  @Header("Cache-Control", "no-cache, no-store, must-revalidate")
  async getInstructorAvailability(
    @Request() req: { user: { id: string } },
    @Query("instructorId") instructorId?: string,
  ) {
    return this.bookingService.getInstructorAvailability(
      req.user.id,
      instructorId,
    );
  }

  /** Link the learner to a new instructor */
  @Post("link-instructor")
  async linkInstructor(
    @Request() req: { user: { id: string } },
    @Body("instructorId") instructorId: string,
  ) {
    return this.bookingService.linkInstructor(req.user.id, instructorId);
  }

  /** Switch the primary instructor and return their availability */
  @Post("switch-instructor")
  async switchInstructor(
    @Request() req: { user: { id: string } },
    @Body("instructorId") instructorId: string,
  ) {
    return this.bookingService.switchInstructor(req.user.id, instructorId);
  }

  @Get("packages")
  @Header("Cache-Control", "no-cache, no-store, must-revalidate")
  async getInstructorPackages(
    @Request() req: { user: { id: string } },
    @Query("instructorId") instructorId?: string,
  ) {
    return this.bookingService.getInstructorPackages(
      req.user.id,
      instructorId,
    );
  }

  @Post("lesson")
  async bookLesson(
    @Request() req: { user: { id: string } },
    @Body() dto: BookLessonDto,
  ) {
    return this.bookingService.bookLesson(req.user.id, dto);
  }

  @Post("package")
  async bookPackage(
    @Request() req: { user: { id: string } },
    @Body() dto: BookPackageDto,
  ) {
    return this.bookingService.bookPackage(req.user.id, dto);
  }
}
