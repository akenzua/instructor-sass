import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Model } from "mongoose";
import Stripe from "stripe";
import { Payment, PaymentDocument } from "../../schemas/payment.schema";
import { CreatePaymentIntentDto } from "./dto/payment.dto";
import { LearnersService } from "../learners/learners.service";
import { LessonsService } from "../lessons/lessons.service";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
    @Inject(forwardRef(() => LearnersService))
    private learnersService: LearnersService,
    @Inject(forwardRef(() => LessonsService))
    private lessonsService: LessonsService
  ) {
    const stripeKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: "2024-12-18.acacia" as any,
      });
    }
  }

  async createPaymentIntent(
    instructorId: string,
    dto: CreatePaymentIntentDto
  ): Promise<{ clientSecret: string; paymentId: string }> {
    if (!this.stripe) {
      throw new BadRequestException("Stripe not configured");
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100), // Convert to pence
      currency: "gbp",
      metadata: {
        instructorId,
        learnerId: dto.learnerId,
        lessonIds: dto.lessonIds?.join(",") || "",
        packageId: dto.packageId || "",
      },
    });

    // Create payment record
    const payment = await this.paymentModel.create({
      instructorId,
      learnerId: dto.learnerId,
      lessonIds: dto.lessonIds || [],
      packageId: dto.packageId,
      amount: dto.amount,
      currency: "GBP",
      status: "pending",
      method: "card",
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      description: dto.description,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentId: payment._id.toString(),
    };
  }

  async handleWebhook(
    payload: Buffer,
    signature: string
  ): Promise<{ received: boolean }> {
    if (!this.stripe) {
      throw new BadRequestException("Stripe not configured");
    }

    const webhookSecret = this.configService.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new BadRequestException("Webhook secret not configured");
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed`);
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(paymentIntent);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await this.handleRefund(charge);
        break;
      }
    }

    return { received: true };
  }

  private async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (!payment) return;

    payment.status = "succeeded";
    payment.paidAt = new Date();
    await payment.save();

    // Update lesson payment statuses
    if (payment.lessonIds.length > 0) {
      await this.lessonsService.updatePaymentStatus(
        payment.lessonIds.map((id) => id.toString()),
        "paid"
      );
    }

    // Update learner balance
    await this.learnersService.updateBalance(
      payment.learnerId.toString(),
      payment.amount
    );
  }

  private async handlePaymentFailure(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    await this.paymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { $set: { status: "failed" } }
    );
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: charge.payment_intent,
    });

    if (!payment) return;

    payment.status = "refunded";
    payment.refundedAt = new Date();
    await payment.save();

    // Update lesson payment statuses
    if (payment.lessonIds.length > 0) {
      await this.lessonsService.updatePaymentStatus(
        payment.lessonIds.map((id) => id.toString()),
        "refunded"
      );
    }

    // Deduct from learner balance
    await this.learnersService.updateBalance(
      payment.learnerId.toString(),
      -payment.amount
    );
  }

  async findByLearner(
    instructorId: string,
    learnerId: string
  ): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({ instructorId, learnerId })
      .sort({ createdAt: -1 });
  }
}
