import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SyllabusService } from "./syllabus.service";
import {
  CreateSyllabusDto,
  UpdateSyllabusDto,
  ScoreTopicDto,
  CompleteTopicDto,
  InitProgressDto,
} from "./dto/syllabus.dto";

@Controller("syllabus")
@UseGuards(JwtAuthGuard)
export class SyllabusController {
  constructor(private readonly syllabusService: SyllabusService) {}

  // ============================================================================
  // Syllabus CRUD
  // ============================================================================

  @Post()
  create(@Req() req, @Body() dto: CreateSyllabusDto) {
    return this.syllabusService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.syllabusService.findAll(req.user.id);
  }

  @Get("default")
  getDefault(@Req() req) {
    return this.syllabusService.getDefault(req.user.id);
  }

  @Get(":id")
  findById(@Req() req, @Param("id") id: string) {
    return this.syllabusService.findById(req.user.id, id);
  }

  @Put(":id")
  update(@Req() req, @Param("id") id: string, @Body() dto: UpdateSyllabusDto) {
    return this.syllabusService.update(req.user.id, id, dto);
  }

  @Delete(":id")
  delete(@Req() req, @Param("id") id: string) {
    return this.syllabusService.delete(req.user.id, id);
  }

  // ============================================================================
  // Learner Progress
  // ============================================================================

  @Post("progress/init")
  initProgress(@Req() req, @Body() dto: InitProgressDto) {
    return this.syllabusService.initProgress(req.user.id, dto);
  }

  @Get("progress/learner/:learnerId")
  getProgress(@Req() req, @Param("learnerId") learnerId: string) {
    return this.syllabusService.getProgress(req.user.id, learnerId);
  }

  @Post("progress/score")
  scoreTopic(@Req() req, @Body() dto: ScoreTopicDto) {
    return this.syllabusService.scoreTopic(req.user.id, dto);
  }

  @Post("progress/complete")
  completeTopic(@Req() req, @Body() dto: CompleteTopicDto) {
    return this.syllabusService.completeTopic(req.user.id, dto);
  }

  @Post("progress/reopen")
  reopenTopic(
    @Req() req,
    @Body() body: { learnerId: string; topicOrder: number },
  ) {
    return this.syllabusService.reopenTopic(
      req.user.id,
      body.learnerId,
      body.topicOrder,
    );
  }
}
