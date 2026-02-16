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
  Header,
} from "@nestjs/common";
import { LearnersService } from "./learners.service";
import { CreateLearnerDto, UpdateLearnerDto, LearnerQueryDto } from "./dto/learner.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { LessonsService } from "../lessons/lessons.service";

@Controller("learners")
export class LearnersController {
  constructor(
    private readonly learnersService: LearnersService,
    private readonly lessonsService: LessonsService,
  ) {}

  // Learner's own endpoints (authenticated as learner)
  @Get("me/lessons")
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async getMyLessons(
    @Request() req: { user: { id: string; type?: string } },
    @Query() query: { status?: string; limit?: number }
  ) {
    return this.learnersService.getLearnerLessons(req.user.id, query);
  }

  @Get("me/payments")
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async getMyPayments(
    @Request() req: { user: { id: string; type?: string } }
  ) {
    return this.learnersService.getLearnerPayments(req.user.id);
  }

  // Instructor endpoints (authenticated as instructor)
  @Get("me/lessons/:lessonId/cancel-preview")
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async previewCancellationFee(
    @Request() req: { user: { id: string; type?: string } },
    @Param("lessonId") lessonId: string
  ) {
    return this.lessonsService.previewCancellationFee(req.user.id, lessonId);
  }

  @Post("me/lessons/:lessonId/cancel")
  @UseGuards(JwtAuthGuard)
  async cancelMyLesson(
    @Request() req: { user: { id: string; type?: string } },
    @Param("lessonId") lessonId: string,
    @Body() body: { reason?: string }
  ) {
    return this.lessonsService.cancelByLearner(
      req.user.id,
      lessonId,
      body.reason
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateLearnerDto
  ) {
    return this.learnersService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req: { user: { id: string } },
    @Query() query: LearnerQueryDto
  ) {
    return this.learnersService.findAll(req.user.id, query);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findById(
    @Request() req: { user: { id: string } },
    @Param("id") id: string
  ) {
    return this.learnersService.findById(req.user.id, id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateLearnerDto
  ) {
    return this.learnersService.update(req.user.id, id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async delete(
    @Request() req: { user: { id: string } },
    @Param("id") id: string
  ) {
    return this.learnersService.delete(req.user.id, id);
  }
}
