import { IsEmail, IsString, MinLength, IsOptional, IsNumber, Min } from "class-validator";

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hourlyRate?: number;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}

export class MagicLinkDto {
  @IsEmail()
  email: string;
}

export class VerifyMagicLinkDto {
  @IsString()
  token: string;
}

export class LearnerSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  lastName?: string;
}

export class UpdateLearnerProfileDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
