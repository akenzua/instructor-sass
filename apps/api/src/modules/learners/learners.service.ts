import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Model, Types } from "mongoose";
import { Learner, LearnerDocument } from "../../schemas/learner.schema";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";
import { Payment, PaymentDocument } from "../../schemas/payment.schema";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import { CreateLearnerDto, UpdateLearnerDto, LearnerQueryDto } from "./dto/learner.dto";
import { EmailService } from "../email/email.service";
import { InstructorsService } from "../instructors/instructors.service";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class LearnersService {
  constructor(
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    private emailService: EmailService,
    private instructorsService: InstructorsService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  async create(instructorId: string, dto: CreateLearnerDto): Promise<LearnerDocument> {
    // Check for duplicate email for this instructor
    const existing = await this.learnerModel.findOne({
      instructorId,
      email: dto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException("Learner with this email already exists");
    }

    const learner = await this.learnerModel.create({
      ...dto,
      email: dto.email.toLowerCase(),
      instructorId,
    });

    // Send invite email with magic link
    try {
      const instructor = await this.instructorsService.findById(instructorId);
      const instructorName = `${instructor.firstName} ${instructor.lastName}`.trim() || 'Your instructor';
      
      // Generate magic link token using AuthService
      const token = this.authService.generateMagicToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      this.authService.storeMagicLinkToken(token, learner.email, expiresAt);

      const learnerAppUrl = this.configService.get<string>('LEARNER_APP_URL', 'http://localhost:3002');
      const magicLink = `${learnerAppUrl}/verify?token=${token}`;
      
      await this.emailService.sendLearnerInviteEmail(
        learner.email,
        magicLink,
        token,
        instructorName
      );
    } catch (error) {
      console.error('Failed to send invite email:', error);
      // Don't fail the create if email fails - learner can request new magic link
    }

    return learner;
  }

  async findAll(instructorId: string, query: LearnerQueryDto) {
    const { page = 1, limit = 20, status, search } = query;

    const filter: Record<string, unknown> = { instructorId };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.learnerModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.learnerModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(instructorId: string, id: string): Promise<LearnerDocument> {
    const learner = await this.learnerModel.findOne({ _id: id, instructorId });
    if (!learner) {
      throw new NotFoundException("Learner not found");
    }
    return learner;
  }

  async update(
    instructorId: string,
    id: string,
    dto: UpdateLearnerDto
  ): Promise<LearnerDocument> {
    const learner = await this.learnerModel.findOneAndUpdate(
      { _id: id, instructorId },
      { $set: dto },
      { new: true }
    );
    if (!learner) {
      throw new NotFoundException("Learner not found");
    }
    return learner;
  }

  async delete(instructorId: string, id: string): Promise<void> {
    const result = await this.learnerModel.deleteOne({ _id: id, instructorId });
    if (result.deletedCount === 0) {
      throw new NotFoundException("Learner not found");
    }
  }

  async updateBalance(id: string, amount: number): Promise<void> {
    console.log('[UpdateBalance] Updating learner', id, 'by', amount);
    
    // First verify learner exists
    const existing = await this.learnerModel.findById(id);
    if (!existing) {
      console.error('[UpdateBalance] LEARNER NOT FOUND:', id);
      throw new NotFoundException(`Learner ${id} not found for balance update`);
    }
    console.log('[UpdateBalance] Current balance:', existing.balance);
    
    const result = await this.learnerModel.findByIdAndUpdate(
      id,
      { $inc: { balance: amount } },
      { new: true }
    );
    
    if (!result) {
      console.error('[UpdateBalance] findByIdAndUpdate returned null for learner:', id);
      throw new Error(`Failed to update balance for learner ${id}`);
    }
    console.log('[UpdateBalance] New balance for learner', id, ':', result.balance);
  }

  async incrementLessonCount(id: string, completed: boolean): Promise<void> {
    const update: Record<string, number> = { totalLessons: 1 };
    if (completed) {
      update.completedLessons = 1;
    }
    await this.learnerModel.findByIdAndUpdate(id, { $inc: update });
  }

  async findByIdAny(id: string): Promise<LearnerDocument | null> {
    return this.learnerModel.findById(id);
  }

  async assignToInstructor(id: string, instructorId: string): Promise<LearnerDocument> {
    const learner = await this.learnerModel.findByIdAndUpdate(
      id,
      { $set: { instructorId } },
      { new: true }
    );
    if (!learner) {
      throw new NotFoundException("Learner not found");
    }
    return learner;
  }

  // Learner's own methods
  async getLearnerLessons(learnerId: string, query: { status?: string; limit?: number }) {
    const learnerObjectId = new Types.ObjectId(learnerId);
    const filter: any = { learnerId: learnerObjectId };
    
    if (query.status) {
      filter.status = query.status;
    }

    let queryBuilder = this.lessonModel
      .find(filter)
      .populate('instructorId', 'firstName lastName email phone')
      .sort({ startTime: 1 });

    if (query.limit) {
      queryBuilder = queryBuilder.limit(Number(query.limit));
    }

    return queryBuilder.exec();
  }

  async getLearnerPayments(learnerId: string) {
    const learnerObjectId = new Types.ObjectId(learnerId);
    return this.paymentModel
      .find({ learnerId: learnerObjectId })
      .populate('instructorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Generate a printable HTML receipt for a payment.
   * Only returns receipts for succeeded payments belonging to the learner.
   */
  async generateReceiptHtml(learnerId: string, paymentId: string): Promise<string | null> {
    const payment = await this.paymentModel.findOne({
      _id: paymentId,
      learnerId: new Types.ObjectId(learnerId),
      status: 'succeeded',
    });

    if (!payment) return null;

    const learner = await this.learnerModel.findById(learnerId);
    const instructor = await this.instructorModel.findById(payment.instructorId);

    const learnerName = learner ? `${learner.firstName || ''} ${learner.lastName || ''}`.trim() || learner.email : 'Unknown';
    const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Unknown';
    const currencySymbol = (payment.currency || 'GBP') === 'GBP' ? '£' : payment.currency;
    const formattedAmount = `${currencySymbol}${payment.amount.toFixed(2)}`;
    const paidAt = payment.paidAt || payment.createdAt;
    const formattedDate = paidAt.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const formattedTime = paidAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const receiptNumber = `RCP-${payment._id.toString().slice(-8).toUpperCase()}`;
    const appName = this.configService.get<string>('APP_NAME', 'InDrive');

    const typeLabels: Record<string, string> = {
      'top-up': 'Account Top-Up',
      'lesson-booking': 'Lesson Booking',
      'package-booking': 'Package Purchase',
      'cancellation-fee': 'Cancellation Fee',
      'refund': 'Refund',
    };
    const typeLabel = typeLabels[payment.type] || payment.type;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt ${receiptNumber} - ${appName}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 40px 20px;
      background: #f5f5f5;
    }
    .receipt-card {
      background: white; border-radius: 12px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    .receipt-header {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      padding: 30px; color: white;
    }
    .receipt-header h1 { margin: 0; font-size: 24px; }
    .receipt-header p { margin: 4px 0 0; opacity: 0.9; font-size: 14px; }
    .receipt-body { padding: 30px; }
    .receipt-meta { display: flex; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .receipt-meta-item label { display: block; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .receipt-meta-item span { font-weight: 700; font-size: 15px; font-family: monospace; }
    .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .receipt-table td { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .receipt-table td:first-child { color: #666; }
    .receipt-table td:last-child { text-align: right; font-weight: 600; }
    .receipt-table tr:last-child td { border-bottom: none; padding-top: 16px; }
    .total-row td { font-size: 20px !important; font-weight: 700 !important; color: #10B981 !important; border-top: 2px solid #e2e8f0 !important; }
    .status-badge {
      display: inline-block; padding: 4px 12px; border-radius: 9999px;
      background: #ecfdf5; color: #065f46; font-size: 13px; font-weight: 600;
    }
    .receipt-footer { padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
    .receipt-footer p { margin: 0; font-size: 12px; color: #999; }
    .print-btn {
      display: block; margin: 20px auto; padding: 12px 32px; font-size: 16px;
      background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;
    }
    .print-btn:hover { background: #059669; }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="receipt-header">
      <h1>Payment Receipt</h1>
      <p>${appName}</p>
    </div>
    <div class="receipt-body">
      <div class="receipt-meta">
        <div class="receipt-meta-item">
          <label>Receipt Number</label>
          <span>${receiptNumber}</span>
        </div>
        <div class="receipt-meta-item">
          <label>Date</label>
          <span>${formattedDate}</span>
        </div>
        <div class="receipt-meta-item">
          <label>Time</label>
          <span>${formattedTime}</span>
        </div>
        <div class="receipt-meta-item">
          <label>Status</label>
          <span class="status-badge">✅ Paid</span>
        </div>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

      <p style="margin: 0 0 4px;"><strong>Billed to:</strong> ${learnerName}</p>
      <p style="margin: 0; color: #666; font-size: 14px;">${learner?.email || ''}</p>

      <table class="receipt-table">
        <tr>
          <td>Type</td>
          <td>${typeLabel}</td>
        </tr>
        <tr>
          <td>Instructor</td>
          <td>${instructorName}</td>
        </tr>
        <tr>
          <td>Payment Method</td>
          <td style="text-transform: capitalize;">${payment.method || 'card'}</td>
        </tr>
        ${payment.description ? `<tr><td>Description</td><td>${payment.description}</td></tr>` : ''}
        <tr class="total-row">
          <td>Amount Paid</td>
          <td>${formattedAmount}</td>
        </tr>
      </table>
    </div>
    <div class="receipt-footer">
      <p>This is an automated receipt generated by ${appName}.</p>
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
</body>
</html>`;
  }
}
