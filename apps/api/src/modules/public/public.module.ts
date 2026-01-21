import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PublicController } from "./public.controller";
import { PublicService } from "./public.service";
import {
  Instructor,
  InstructorSchema,
} from "../../schemas/instructor.schema";
import {
  WeeklyAvailability,
  WeeklyAvailabilitySchema,
  AvailabilityOverride,
  AvailabilityOverrideSchema,
} from "../../schemas/availability.schema";
import { Package, PackageSchema } from "../../schemas/package.schema";
import { Lesson, LessonSchema } from "../../schemas/lesson.schema";
import { Learner, LearnerSchema } from "../../schemas/learner.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Instructor.name, schema: InstructorSchema },
      { name: WeeklyAvailability.name, schema: WeeklyAvailabilitySchema },
      { name: AvailabilityOverride.name, schema: AvailabilityOverrideSchema },
      { name: Package.name, schema: PackageSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Learner.name, schema: LearnerSchema },
    ]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
