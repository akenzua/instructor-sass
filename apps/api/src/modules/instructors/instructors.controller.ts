import { Controller, Get, Put, Body, UseGuards, Request, Param, BadRequestException } from "@nestjs/common";
import { InstructorsService } from "./instructors.service";
import { UpdateInstructorDto } from "./dto/instructor.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("instructors")
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMe(@Request() req: { user: { id: string } }) {
    return this.instructorsService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put("me")
  async updateMe(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateInstructorDto
  ) {
    // If username is being updated, check availability
    if (dto.username) {
      const isAvailable = await this.instructorsService.isUsernameAvailable(
        dto.username,
        req.user.id
      );
      if (!isAvailable) {
        throw new BadRequestException("Username is already taken");
      }
    }
    return this.instructorsService.update(req.user.id, dto);
  }

  /**
   * Check if a username is available
   * GET /api/instructors/username-check/:username
   */
  @UseGuards(JwtAuthGuard)
  @Get("username-check/:username")
  async checkUsername(
    @Request() req: { user: { id: string } },
    @Param("username") username: string
  ) {
    const isAvailable = await this.instructorsService.isUsernameAvailable(
      username,
      req.user.id
    );
    return { available: isAvailable };
  }
}
