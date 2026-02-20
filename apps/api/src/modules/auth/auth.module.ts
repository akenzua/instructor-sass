import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LicenceVerificationService } from "./licence-verification.service";
import { Instructor, InstructorSchema } from "../../schemas/instructor.schema";
import { Learner, LearnerSchema } from "../../schemas/learner.schema";
import { Lesson, LessonSchema } from "../../schemas/lesson.schema";
import { MagicLinkToken, MagicLinkTokenSchema } from "../../schemas/magic-link-token.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Instructor.name, schema: InstructorSchema },
      { name: Learner.name, schema: LearnerSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: MagicLinkToken.name, schema: MagicLinkTokenSchema },
    ]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN", "7d"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, LicenceVerificationService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
