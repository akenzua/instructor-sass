import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Lesson, LessonSchema } from "../../schemas/lesson.schema";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import { Payment, PaymentSchema } from "../../schemas/payment.schema";
import { LessonsService } from "./lessons.service";
import { LessonsController } from "./lessons.controller";
import { LearnersModule } from "../learners/learners.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    forwardRef(() => LearnersModule),
  ],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonsModule {}
