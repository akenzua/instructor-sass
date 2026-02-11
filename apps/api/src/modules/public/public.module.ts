import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { PublicController } from "./public.controller";
import { PublicService } from "./public.service";
import { PostcodeService } from "./postcode.service";
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
import { Payment, PaymentSchema } from "../../schemas/payment.schema";
import { AuthModule } from "../auth/auth.module";
import { EmailModule } from "../email/email.module";
import { PaymentsModule } from "../payments/payments.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Instructor.name, schema: InstructorSchema },
      { name: WeeklyAvailability.name, schema: WeeklyAvailabilitySchema },
      { name: AvailabilityOverride.name, schema: AvailabilityOverrideSchema },
      { name: Package.name, schema: PackageSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Learner.name, schema: LearnerSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    ConfigModule,
    forwardRef(() => AuthModule),
    EmailModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [PublicController],
  providers: [PublicService, PostcodeService],
  exports: [PublicService, PostcodeService],
})
export class PublicModule {}
