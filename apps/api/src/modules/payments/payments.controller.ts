import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Param,
  UseGuards,
  Request,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Request() req: { user: { id: string } },
    @Body() dto: CreatePaymentIntentDto
  ) {
    return this.paymentsService.createPaymentIntent(req.user.id, dto);
  }

  @Post('confirm/:paymentIntentId')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.confirmPayment(paymentIntentId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<ExpressRequest>,
    @Headers('stripe-signature') signature: string
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error('Raw body not available');
    }
    return this.paymentsService.handleWebhook(rawBody, signature);
  }

  @Get('learner/:learnerId')
  @UseGuards(JwtAuthGuard)
  async findByLearner(
    @Request() req: { user: { id: string } },
    @Param('learnerId') learnerId: string
  ) {
    return this.paymentsService.findByLearner(req.user.id, learnerId);
  }
}
