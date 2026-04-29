import { IsEmail, IsString, MinLength, IsOptional, IsNumber, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

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

export class SchoolAddressDto {
  @IsString()
  @IsOptional()
  line1?: string;

  @IsString()
  @IsOptional()
  line2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postcode?: string;
}

export class SchoolSignupDto {
  // School info
  @IsString()
  @MinLength(1)
  schoolName: string;

  @IsEmail()
  schoolEmail: string;

  @IsString()
  @IsOptional()
  schoolPhone?: string;

  @IsString()
  @IsOptional()
  businessRegistrationNumber?: string;

  @ValidateNested()
  @Type(() => SchoolAddressDto)
  @IsOptional()
  address?: SchoolAddressDto;

  // Admin personal info
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class AcceptInvitationDto {
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
