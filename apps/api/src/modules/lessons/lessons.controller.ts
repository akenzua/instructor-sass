import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { LessonsService } from "./lessons.service";
import {
  CreateLessonDto,
  UpdateLessonDto,
  LessonQueryDto,
  CancelLessonDto,
  CompleteLessonDto,
} from "./dto/lesson.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("lessons")
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  async create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateLessonDto
  ) {
    return this.lessonsService.create(req.user.id, dto);
  }

  @Get()
  async findAll(
    @Request() req: { user: { id: string } },
    @Query() query: LessonQueryDto
  ) {
    return this.lessonsService.findAll(req.user.id, query);
  }

  @Get("stats")
  async getStats(@Request() req: { user: { id: string } }) {
    return this.lessonsService.getStats(req.user.id);
  }

  @Get(":id")
  async findById(
    @Request() req: { user: { id: string } },
    @Param("id") id: string
  ) {
    return this.lessonsService.findById(req.user.id, id);
  }

  @Put(":id")
  async update(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateLessonDto
  ) {
    return this.lessonsService.update(req.user.id, id, dto);
  }

  @Post(":id/cancel")
  async cancel(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: CancelLessonDto
  ) {
    return this.lessonsService.cancel(req.user.id, id, dto.reason);
  }

  @Post(":id/complete")
  async complete(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: CompleteLessonDto
  ) {
    return this.lessonsService.complete(req.user.id, id, dto.notes);
  }

  @Delete(":id")
  async delete(
    @Request() req: { user: { id: string } },
    @Param("id") id: string
  ) {
    return this.lessonsService.delete(req.user.id, id);
  }
}
