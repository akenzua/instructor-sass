import { Controller, Get, Put, Body, UseGuards, Request } from "@nestjs/common";
import { InstructorsService } from "./instructors.service";
import { UpdateInstructorDto } from "./dto/instructor.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("instructors")
@UseGuards(JwtAuthGuard)
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get("me")
  async getMe(@Request() req: { user: { id: string } }) {
    return this.instructorsService.findById(req.user.id);
  }

  @Put("me")
  async updateMe(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateInstructorDto
  ) {
    return this.instructorsService.update(req.user.id, dto);
  }
}
