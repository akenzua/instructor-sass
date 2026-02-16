import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Learner, LearnerSchema } from "../../schemas/learner.schema";
import { Lesson, LessonSchema } from "../../schemas/lesson.schema";
import { Payment, PaymentSchema } from "../../schemas/payment.schema";
import { LearnersService } from "./learners.service";
import { LearnersController } from "./learners.controller";
import { InstructorsModule } from "../instructors/instructors.module";
import { AuthModule } from "../auth/auth.module";
import { LessonsModule } from "../lessons/lessons.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Learner.name, schema: LearnerSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    InstructorsModule,
    forwardRef(() => AuthModule),
    forwardRef(() => LessonsModule),
  ],
  providers: [LearnersService],
  controllers: [LearnersController],
  exports: [LearnersService],
})
export class LearnersModule {}
