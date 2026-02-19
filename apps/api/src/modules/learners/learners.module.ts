import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Learner, LearnerSchema } from "../../schemas/learner.schema";
import { Lesson, LessonSchema } from "../../schemas/lesson.schema";
import { Payment, PaymentSchema } from "../../schemas/payment.schema";
import { Package, PackageSchema } from "../../schemas/package.schema";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import {
  WeeklyAvailability,
  WeeklyAvailabilitySchema,
  AvailabilityOverride,
  AvailabilityOverrideSchema,
} from "../../schemas/availability.schema";
import {
  LearnerInstructorLink,
  LearnerInstructorLinkSchema,
} from "../../schemas/learner-instructor-link.schema";
import { LearnersService } from "./learners.service";
import { LearnersBookingService } from "./learners-booking.service";
import { LearnerLinkService } from "./learner-link.service";
import { LearnersController } from "./learners.controller";
import { LearnersBookingController } from "./learners-booking.controller";
import { InstructorsModule } from "../instructors/instructors.module";
import { AuthModule } from "../auth/auth.module";
import { LessonsModule } from "../lessons/lessons.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Learner.name, schema: LearnerSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Package.name, schema: PackageSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: WeeklyAvailability.name, schema: WeeklyAvailabilitySchema },
      { name: AvailabilityOverride.name, schema: AvailabilityOverrideSchema },
      { name: LearnerInstructorLink.name, schema: LearnerInstructorLinkSchema },
    ]),
    InstructorsModule,
    forwardRef(() => AuthModule),
    forwardRef(() => LessonsModule),
  ],
  providers: [LearnersService, LearnersBookingService, LearnerLinkService],
  controllers: [LearnersController, LearnersBookingController],
  exports: [LearnersService, LearnerLinkService],
})
export class LearnersModule {}
