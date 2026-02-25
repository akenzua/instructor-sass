import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Lesson, LessonSchema } from "../../schemas/lesson.schema";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import { Payment, PaymentSchema } from "../../schemas/payment.schema";
import { Learner, LearnerSchema } from "../../schemas/learner.schema";
import { LessonsService } from "./lessons.service";
import { LessonsController } from "./lessons.controller";
import { LearnersModule } from "../learners/learners.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Learner.name, schema: LearnerSchema },
    ]),
    forwardRef(() => LearnersModule),
  ],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonsModule {}
