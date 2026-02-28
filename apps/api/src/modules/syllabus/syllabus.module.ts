import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Syllabus,
  SyllabusSchema,
  LearnerProgress,
  LearnerProgressSchema,
} from "../../schemas/syllabus.schema";
import { Lesson, LessonSchema } from "../../schemas/lesson.schema";
import { SyllabusService } from "./syllabus.service";
import { SyllabusController } from "./syllabus.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Syllabus.name, schema: SyllabusSchema },
      { name: LearnerProgress.name, schema: LearnerProgressSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  providers: [SyllabusService],
  controllers: [SyllabusController],
  exports: [SyllabusService],
})
export class SyllabusModule {}
