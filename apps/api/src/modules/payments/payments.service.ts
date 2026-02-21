import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Payment, PaymentDocument } from '../../schemas/payment.schema';
import { Instructor, InstructorDocument } from '../../schemas/instructor.schema';
import { Learner, LearnerDocument } from '../../schemas/learner.schema';
import { CreatePaymentIntentDto } from './dto/payment.dto';
import { LearnersService } from '../learners/learners.service';
import { LearnerLinkService } from '../learners/learner-link.service';
import { LessonsService } from '../lessons/lessons.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>,
    private configService: ConfigService,
    @Inject(forwardRef(() => LearnersService))
    private learnersService: LearnersService,
    @Inject(forwardRef(() => LessonsService))
    private lessonsService: LessonsService,
    private linkService: LearnerLinkService,
    private emailService: EmailService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2024-12-18.acacia' as any,
      });
    }
  }

  async createPaymentIntent(
    instructorId: string,
    dto: CreatePaymentIntentDto
  ): Promise<{ clientSecret: string; paymentId: string; paymentIntentId: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100), // Convert to pence
      currency: 'gbp',
      metadata: {
        instructorId,
        learnerId: dto.learnerId,
        lessonIds: dto.lessonIds?.join(',') || '',
        packageId: dto.packageId || '',
      },
    });

    // Create payment record
    const payment = await this.paymentModel.create({
      type: 'top-up',
      instructorId,
      learnerId: dto.learnerId,
      lessonIds: dto.lessonIds || [],
      packageId: dto.packageId,
      amount: dto.amount,
      currency: 'GBP',
      status: 'pending',
      method: 'card',
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      description: dto.description,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentId: payment._id.toString(),
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Create a payment intent initiated by a learner.
   * Automatically resolves learnerId from the JWT and finds the learner's instructor.
   */
  async createLearnerPaymentIntent(
    learnerId: string,
    dto: CreatePaymentIntentDto
  ): Promise<{ clientSecret: string; paymentId: string; paymentIntentId: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    console.log('[CreateLearnerPayment] learnerId:', learnerId, 'amount:', dto.amount);

    // Find learner to get their instructor
    const learner = await this.learnersService.findByIdAny(learnerId);
    if (!learner) {
      throw new BadRequestException('Learner not found');
    }

    // Resolve instructor: explicit from DTO, primary on learner, or fallback to most recent link
    let instructorId = dto.instructorId || learner.instructorId?.toString();
    if (!instructorId) {
      const links = await this.linkService.getLearnerInstructors(learnerId);
      if (links.length > 0) {
        instructorId = links[0].instructorId.toString();
      }
    }
    if (!instructorId) {
      throw new BadRequestException('No linked instructor found. Please link to an instructor first.');
    }

    console.log('[CreateLearnerPayment] Found instructor:', instructorId, 'for learner:', learnerId);

    // Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100), // Convert to pence
      currency: 'gbp',
      metadata: {
        instructorId,
        learnerId,
        lessonIds: dto.lessonIds?.join(',') || '',
        packageId: dto.packageId || '',
      },
    });

    // Create payment record
    const payment = await this.paymentModel.create({
      type: 'top-up',
      instructorId,
      learnerId,
      lessonIds: dto.lessonIds || [],
      packageId: dto.packageId,
      amount: dto.amount,
      currency: 'GBP',
      status: 'pending',
      method: 'card',
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      description: dto.description || 'Account top-up',
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentId: payment._id.toString(),
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<{ received: boolean }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(paymentIntent);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await this.handleRefund(charge);
        break;
      }
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('[PaymentSuccess] Processing payment intent:', paymentIntent.id);

    // Atomically claim the payment: only one caller can transition pending → succeeded.
    // This prevents double-credit from concurrent webhook + confirmPayment calls.
    const payment = await this.paymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id, status: 'pending' },
      { $set: { status: 'succeeded', paidAt: new Date() } },
      { new: true }
    );

    if (!payment) {
      // Either no record exists or it was already processed
      const existing = await this.paymentModel.findOne({ stripePaymentIntentId: paymentIntent.id });
      console.log('[PaymentSuccess] No pending payment found for intent:', paymentIntent.id,
        existing ? `(already ${existing.status})` : '(no record)');
      return;
    }

    const learnerId = payment.learnerId.toString();
    const amount = payment.amount;

    console.log('[PaymentSuccess] Claimed payment:', payment._id, 'learnerId:', learnerId, 'amount:', amount);

    // Update learner balance
    try {
      await this.learnersService.updateBalance(learnerId, amount);
      console.log('[PaymentSuccess] Balance updated for learner:', learnerId);
    } catch (err) {
      // Balance update failed — revert payment status so it can be retried
      console.error('[PaymentSuccess] FAILED to update balance, reverting payment to pending:', err);
      await this.paymentModel.findByIdAndUpdate(payment._id, { $set: { status: 'pending', paidAt: null } });
      throw err;
    }

    // Update lesson payment statuses (non-critical)
    if (payment.lessonIds && payment.lessonIds.length > 0) {
      try {
        await this.lessonsService.updatePaymentStatus(
          payment.lessonIds.map((id) => id.toString()),
          'paid'
        );
      } catch (err) {
        console.error('[PaymentSuccess] Failed to update lesson statuses:', err);
      }
    }

    console.log('[PaymentSuccess] Fully processed payment:', payment._id);

    // Send receipt email (non-blocking)
    this.sendReceiptEmail(payment).catch(err =>
      console.error('[PaymentSuccess] Failed to send receipt email:', err)
    );
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.paymentModel.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { $set: { status: 'failed' } }
    );
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: charge.payment_intent,
    });

    if (!payment) return;

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();

    // Update lesson payment statuses
    if (payment.lessonIds.length > 0) {
      await this.lessonsService.updatePaymentStatus(
        payment.lessonIds.map((id) => id.toString()),
        'refunded'
      );
    }

    // Deduct from learner balance
    await this.learnersService.updateBalance(payment.learnerId.toString(), -payment.amount);
  }

  async findByLearner(instructorId: string, learnerId: string): Promise<PaymentDocument[]> {
    return this.paymentModel.find({ instructorId, learnerId }).sort({ createdAt: -1 });
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentDocument | null> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    console.log('[ConfirmPayment] Confirming payment intent:', paymentIntentId);

    // Fetch the PaymentIntent from Stripe to get the real status
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('[ConfirmPayment] Stripe status:', paymentIntent.status);

    // Find the payment record
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      console.log('[ConfirmPayment] No payment record found');
      return null;
    }

    console.log('[ConfirmPayment] Payment record found:', payment._id, 'current status:', payment.status, 'learnerId:', payment.learnerId);

    // If already fully processed, return as-is
    if (payment.status === 'succeeded' || payment.status === 'failed') {
      console.log('[ConfirmPayment] Already processed, returning as-is');
      return payment;
    }

    // Update based on Stripe's actual status
    if (paymentIntent.status === 'succeeded') {
      console.log('[ConfirmPayment] Processing success...');
      await this.handlePaymentSuccess(paymentIntent);
      return this.paymentModel.findById(payment._id);
    } else if (
      paymentIntent.status === 'canceled' ||
      paymentIntent.status === 'requires_payment_method'
    ) {
      payment.status = 'failed';
      await payment.save();
      return payment;
    }

    return payment;
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<PaymentDocument | null> {
    return this.paymentModel.findOne({ stripePaymentIntentId: paymentIntentId });
  }

  /**
   * Send a receipt email after a successful payment.
   */
  private async sendReceiptEmail(payment: PaymentDocument): Promise<void> {
    const learner = await this.learnerModel.findById(payment.learnerId);
    if (!learner?.email) {
      console.warn('[Receipt] No learner email found for payment:', payment._id);
      return;
    }

    const instructor = await this.instructorModel.findById(payment.instructorId);
    const instructorName = instructor
      ? `${instructor.firstName} ${instructor.lastName}`
      : 'Unknown';

    await this.emailService.sendPaymentReceiptEmail(learner.email, {
      learnerName: learner.firstName || 'there',
      instructorName,
      amount: payment.amount,
      currency: payment.currency || 'GBP',
      paymentType: payment.type || 'top-up',
      paymentMethod: payment.method || 'card',
      paymentId: payment._id.toString(),
      paidAt: payment.paidAt || new Date(),
      description: payment.description,
    });
  }
}
