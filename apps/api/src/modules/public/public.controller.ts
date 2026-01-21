import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PublicService } from "./public.service";
import { BookLessonDto, PurchasePackageDto } from "./dto/public.dto";

@Controller("public")
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * Get instructor profile by username
   * GET /api/public/instructors/:username
   */
  @Get("instructors/:username")
  async getInstructor(@Param("username") username: string) {
    return this.publicService.getInstructorByUsername(username);
  }

  /**
   * Get instructor's packages
   * GET /api/public/instructors/:username/packages
   */
  @Get("instructors/:username/packages")
  async getPackages(@Param("username") username: string) {
    return this.publicService.getPackagesByUsername(username);
  }

  /**
   * Get instructor's availability
   * GET /api/public/instructors/:username/availability
   */
  @Get("instructors/:username/availability")
  async getAvailability(@Param("username") username: string) {
    return this.publicService.getAvailabilityByUsername(username);
  }

  /**
   * Get available booking slots
   * GET /api/public/instructors/:username/slots?startDate=...&endDate=...&duration=60
   */
  @Get("instructors/:username/slots")
  async getAvailableSlots(
    @Param("username") username: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("duration") duration?: string
  ) {
    const durationMinutes = duration ? parseInt(duration, 10) : 60;
    return this.publicService.getAvailableSlots(
      username,
      startDate,
      endDate,
      durationMinutes
    );
  }

  /**
   * Get instructor's reviews
   * GET /api/public/instructors/:username/reviews
   */
  @Get("instructors/:username/reviews")
  async getReviews(@Param("username") username: string) {
    return this.publicService.getReviewsByUsername(username);
  }

  /**
   * Book a lesson with an instructor
   * POST /api/public/instructors/:username/book
   */
  @Post("instructors/:username/book")
  @HttpCode(HttpStatus.CREATED)
  async bookLesson(
    @Param("username") username: string,
    @Body() dto: BookLessonDto
  ) {
    return this.publicService.bookLesson(username, dto);
  }

  /**
   * Purchase a package
   * POST /api/public/instructors/:username/packages/purchase
   */
  @Post("instructors/:username/packages/purchase")
  @HttpCode(HttpStatus.CREATED)
  async purchasePackage(
    @Param("username") username: string,
    @Body() dto: PurchasePackageDto
  ) {
    return this.publicService.purchasePackage(username, dto);
  }

  /**
   * Check if a username is available
   * GET /api/public/username-check/:username
   */
  @Get("username-check/:username")
  async checkUsername(@Param("username") username: string) {
    try {
      await this.publicService.getInstructorByUsername(username);
      return { available: false };
    } catch {
      return { available: true };
    }
  }
}
