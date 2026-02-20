import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Instructor, InstructorDocument } from "../../schemas/instructor.schema";
import { Learner, LearnerDocument } from "../../schemas/learner.schema";
import { Lesson, LessonDocument } from "../../schemas/lesson.schema";
import { MagicLinkToken, MagicLinkTokenDocument } from "../../schemas/magic-link-token.schema";
import { SignupDto, LoginDto, MagicLinkDto, VerifyMagicLinkDto } from "./dto/auth.dto";
import { CompleteProfileDto } from "./dto/complete-profile.dto";
import { EmailService } from "../email/email.service";
import { LicenceVerificationService } from "./licence-verification.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
    @InjectModel(Learner.name)
    private learnerModel: Model<LearnerDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    @InjectModel(MagicLinkToken.name)
    private magicLinkTokenModel: Model<MagicLinkTokenDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private licenceVerificationService: LicenceVerificationService,
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
    
    // Store token in MongoDB (replaces any existing token for this email)
    await this.magicLinkTokenModel.findOneAndUpdate(
      { email },
      { token, email, expiresAt },
      { upsert: true, new: true }
    );
    console.log(`📝 Stored magic link token in DB for ${email}`);

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
    console.log(`🔍 Verifying magic link token: ${dto.token.substring(0, 10)}...`);
    
    // Demo mode support
    if (dto.token === "demo-learner-token") {
      console.log(`✅ Demo token used, creating/finding demo learner`);
      let learner = await this.learnerModel.findOne({ email: "demo@learner.com" });
      if (!learner) {
        learner = await this.learnerModel.create({
          email: "demo@learner.com",
          firstName: "Demo",
          lastName: "Learner",
          status: 'active',
        });
      }
      const accessToken = this.generateLearnerToken(learner);
      return {
        access_token: accessToken,
        learner: learner.toJSON(),
      };
    }
    
    // Find token in MongoDB
    const tokenDoc = await this.magicLinkTokenModel.findOne({ token: dto.token });
    
    if (!tokenDoc) {
      throw new UnauthorizedException("Invalid or expired magic link");
    }


    if (new Date() > tokenDoc.expiresAt) {
      await this.magicLinkTokenModel.deleteOne({ _id: tokenDoc._id });
      throw new UnauthorizedException("Magic link has expired");
    }

    // Find learner
    const learner = await this.learnerModel.findOne({ email: tokenDoc.email });
    if (!learner) {
      console.log(`❌ Learner not found for email: ${tokenDoc.email}`);
      throw new NotFoundException("Learner not found");
    }

    console.log(`✅ Learner found: ${learner._id}`);

    // If there's a specific booking to confirm, update its status
    let confirmedBooking = null;
    if (tokenDoc.bookingId) {
      confirmedBooking = await this.lessonModel.findByIdAndUpdate(
        tokenDoc.bookingId,
        { status: 'scheduled' },
        { new: true }
      ).populate('instructorId', 'firstName lastName username');
      
      if (confirmedBooking) {
        console.log(`✅ Booking ${tokenDoc.bookingId} confirmed for ${tokenDoc.email}`);
      } else {
        console.log(`⚠️ Booking ${tokenDoc.bookingId} not found`);
      }
    }

    // Also confirm ALL pending-confirmation bookings for this learner
    const pendingResult = await this.lessonModel.updateMany(
      { 
        learnerId: learner._id, 
        status: 'pending-confirmation' 
      },
      { status: 'scheduled' }
    );
    if (pendingResult.modifiedCount > 0) {
      console.log(`✅ Confirmed ${pendingResult.modifiedCount} additional pending bookings for learner ${learner._id}`);
    }

    // Delete used token
    await this.magicLinkTokenModel.deleteOne({ _id: tokenDoc._id });
    console.log(`🗑️ Token deleted from database`);

    // Generate JWT
    const accessToken = this.generateLearnerToken(learner);

    return {
      access_token: accessToken,
      learner: learner.toJSON(),
      confirmedBooking: confirmedBooking ? {
        id: confirmedBooking._id,
        date: confirmedBooking.startTime,
        instructorName: confirmedBooking.instructorId 
          ? `${(confirmedBooking.instructorId as any).firstName} ${(confirmedBooking.instructorId as any).lastName}`
          : undefined,
      } : undefined,
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

  async completeProfile(learnerId: string, dto: CompleteProfileDto) {
    const learner = await this.learnerModel.findById(learnerId);
    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    // 1. Validate age (must be 17+)
    const ageResult = this.licenceVerificationService.validateAge(dto.dateOfBirth);
    if (!ageResult.valid) {
      return {
        success: false,
        error: ageResult.error,
        field: 'dateOfBirth',
      };
    }

    // 2. Verify provisional licence
    const licenceResult = await this.licenceVerificationService.verifyLicence(
      dto.provisionalLicenceNumber,
      dto.lastName,
      dto.dateOfBirth,
    );

    if (!licenceResult.valid) {
      return {
        success: false,
        error: licenceResult.error,
        field: 'provisionalLicenceNumber',
      };
    }

    // 3. Update learner profile
    const updateData: Record<string, any> = {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      dateOfBirth: dto.dateOfBirth,
      licenseNumber: dto.provisionalLicenceNumber.toUpperCase().replace(/\s/g, ''),
      licenceVerified: licenceResult.status === 'verified',
      licenceVerifiedAt: new Date(),
      licenceStatus: licenceResult.status === 'verified' ? 'verified' : 'format_valid' as any,
    };

    if (dto.phone) {
      updateData.phone = dto.phone.trim();
    }

    const updated = await this.learnerModel.findByIdAndUpdate(
      learnerId,
      { $set: updateData },
      { new: true },
    );

    return {
      success: true,
      learner: updated.toJSON(),
      licenceStatus: licenceResult.status,
    };
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

  async storeMagicLinkToken(token: string, email: string, expiresAt: Date, bookingId?: string): Promise<void> {
    await this.magicLinkTokenModel.create({
      token,
      email: email.toLowerCase(),
      expiresAt,
      bookingId: bookingId ? new Types.ObjectId(bookingId) : undefined,
    });
    console.log(`📝 Stored magic link token in DB: ${token.substring(0, 10)}... for ${email}${bookingId ? ` with bookingId: ${bookingId}` : ''}`);
  }

  async getMagicLinkTokenData(token: string): Promise<{ email: string; expiresAt: Date; bookingId?: string } | null> {
    const tokenDoc = await this.magicLinkTokenModel.findOne({ token });
    if (!tokenDoc) return null;
    return {
      email: tokenDoc.email,
      expiresAt: tokenDoc.expiresAt,
      bookingId: tokenDoc.bookingId?.toString(),
    };
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
