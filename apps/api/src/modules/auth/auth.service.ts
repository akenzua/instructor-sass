import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import { Learner, LearnerDocument } from "../../schemas/learner.schema";
import { SignupDto, LoginDto, MagicLinkDto, VerifyMagicLinkDto } from "./dto/auth.dto";
import { EmailService } from "../email/email.service";

@Injectable()
export class AuthService {
  // Store magic link tokens temporarily (in production, use Redis or database)
  private magicLinkTokens = new Map<string, { email: string; expiresAt: Date }>();

  constructor(
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>,
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  async signup(dto: SignupDto) {
    // Check if email exists
    const existing = await this.instructorModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create instructor
    const instructor = await this.instructorModel.create({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken(instructor);

    return {
      accessToken: token,
      instructor: instructor.toJSON(),
    };
  }

  async login(dto: LoginDto) {
    const instructor = await this.instructorModel.findOne({
      email: dto.email.toLowerCase(),
    });

    if (!instructor) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, instructor.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.generateToken(instructor);

    return {
      accessToken: token,
      instructor: instructor.toJSON(),
    };
  }

  async getMe(instructorId: string) {
    const instructor = await this.instructorModel.findById(instructorId);
    if (!instructor) {
      throw new UnauthorizedException("Instructor not found");
    }
    return instructor.toJSON();
  }

  async validateInstructor(id: string): Promise<InstructorDocument | null> {
    return this.instructorModel.findById(id);
  }

  // Magic link methods for learners
  async requestMagicLink(dto: MagicLinkDto) {
    const email = dto.email.toLowerCase();
    
    // Find or create learner by email (self-signup flow)
    let learner = await this.learnerModel.findOne({ email });
    if (!learner) {
      // Auto-create learner on first magic link request (self-signup)
      console.log(`Creating new learner via magic link: ${email}`);
      learner = await this.learnerModel.create({
        email,
        status: 'active',
      });
    }

    // Generate magic link token
    const token = this.generateMagicToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Store token
    this.magicLinkTokens.set(token, { email, expiresAt });

    // Send magic link email
    const magicLink = `http://localhost:3002/verify?token=${token}`;
    await this.emailService.sendMagicLinkEmail(email, magicLink, token);

    return { 
      message: "If an account exists, a magic link has been sent",
      // Include token in response for development/testing only
      ...(process.env.NODE_ENV !== 'production' && { debugToken: token })
    };
  }

  async verifyMagicLink(dto: VerifyMagicLinkDto) {
    const tokenData = this.magicLinkTokens.get(dto.token);
    
    if (!tokenData) {
      throw new UnauthorizedException("Invalid or expired magic link");
    }

    if (new Date() > tokenData.expiresAt) {
      this.magicLinkTokens.delete(dto.token);
      throw new UnauthorizedException("Magic link has expired");
    }

    // Find learner
    const learner = await this.learnerModel.findOne({ email: tokenData.email });
    if (!learner) {
      throw new NotFoundException("Learner not found");
    }

    // Delete used token
    this.magicLinkTokens.delete(dto.token);

    // Generate JWT
    const accessToken = this.generateLearnerToken(learner);

    return {
      access_token: accessToken,
      learner: learner.toJSON(),
    };
  }

  async getLearnerMe(learnerId: string) {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) {
      throw new UnauthorizedException("Learner not found");
    }
    return learner.toJSON();
  }

  async updateLearnerProfile(learnerId: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    const learner = await this.learnerModel.findByIdAndUpdate(
      learnerId,
      { $set: data },
      { new: true }
    );
    if (!learner) {
      throw new NotFoundException("Learner not found");
    }
    return learner.toJSON();
  }

  // Public methods to manage magic link tokens (used by LearnersService for invite emails)
  generateMagicToken(): string {
    // Generate a random token
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  storeMagicLinkToken(token: string, email: string, expiresAt: Date): void {
    this.magicLinkTokens.set(token, { email, expiresAt });
  }

  private generateLearnerToken(learner: LearnerDocument): string {
    const payload = {
      sub: learner._id.toString(),
      email: learner.email,
      type: 'learner',
    };
    return this.jwtService.sign(payload);
  }

  private generateToken(instructor: InstructorDocument): string {
    const payload = {
      sub: instructor._id.toString(),
      email: instructor.email,
    };
    return this.jwtService.sign(payload);
  }
}
