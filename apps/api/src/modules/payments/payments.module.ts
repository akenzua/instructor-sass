import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { Payment, PaymentSchema } from "../../schemas/payment.schema";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { LearnersModule } from "../learners/learners.module";
import { LessonsModule } from "../lessons/lessons.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ConfigModule,
    forwardRef(() => LearnersModule),
    forwardRef(() => LessonsModule),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
