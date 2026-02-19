import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InstructorSearchController } from "./instructor-search.controller";
import { InstructorSearchService } from "./instructor-search.service";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import {
  WeeklyAvailability,
  WeeklyAvailabilitySchema,
} from "../../schemas/availability.schema";
import { Package, PackageSchema } from "../../schemas/package.schema";
import { Lesson, LessonSchema } from "../../schemas/lesson.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Instructor.name, schema: InstructorSchema },
      { name: WeeklyAvailability.name, schema: WeeklyAvailabilitySchema },
      { name: Package.name, schema: PackageSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [InstructorSearchController],
  providers: [InstructorSearchService],
  exports: [InstructorSearchService],
})
export class SearchModule {}
