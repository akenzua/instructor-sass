import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { Payment, PaymentSchema } from "../../schemas/payment.schema";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import { Learner, LearnerSchema } from "../../schemas/learner.schema";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { LearnersModule } from "../learners/learners.module";
import { LessonsModule } from "../lessons/lessons.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Instructor.name, schema: InstructorSchema },
      { name: Learner.name, schema: LearnerSchema },
    ]),
    ConfigModule,
    forwardRef(() => LearnersModule),
    forwardRef(() => LessonsModule),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
