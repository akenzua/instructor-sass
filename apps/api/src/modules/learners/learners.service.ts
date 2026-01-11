import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Model } from "mongoose";
import { Learner, LearnerDocument } from "../../schemas/learner.schema";
import { CreateLearnerDto, UpdateLearnerDto, LearnerQueryDto } from "./dto/learner.dto";
import { EmailService } from "../email/email.service";
import { InstructorsService } from "../instructors/instructors.service";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class LearnersService {
  constructor(
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>,
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
    await this.learnerModel.findByIdAndUpdate(id, {
      $inc: { balance: amount },
    });
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
}
