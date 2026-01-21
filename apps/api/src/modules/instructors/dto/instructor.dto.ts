import { IsString, IsOptional, IsNumber, Min, Max, IsBoolean, IsArray, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ServiceAreaDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  postcode?: string;

  @IsArray()
  @IsOptional()
  coordinates?: number[];

  @IsNumber()
  @IsOptional()
  radiusMiles?: number;
}

class VehicleInfoDto {
  @IsString()
  @IsOptional()
  make?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  transmission?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

class SocialLinksDto {
  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  facebook?: string;

  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  twitter?: string;

  @IsString()
  @IsOptional()
  youtube?: string;

  @IsString()
  @IsOptional()
  tiktok?: string;
}

export class UpdateInstructorDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

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

  @IsString()
  @IsOptional()
  currency?: string;

  // === PUBLIC PROFILE FIELDS ===

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/, {
    message: "Username must be lowercase letters, numbers, and hyphens only (2-40 characters)",
  })
  username?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceAreaDto)
  @IsOptional()
  serviceAreas?: ServiceAreaDto[];

  @IsString()
  @IsOptional()
  primaryLocation?: string;

  @ValidateNested()
  @Type(() => VehicleInfoDto)
  @IsOptional()
  vehicleInfo?: VehicleInfoDto;

  @ValidateNested()
  @Type(() => SocialLinksDto)
  @IsOptional()
  socialLinks?: SocialLinksDto;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  passRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalStudentsTaught?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsExperience?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specializations?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsBoolean()
  @IsOptional()
  isPublicProfileEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  showPricing?: boolean;

  @IsBoolean()
  @IsOptional()
  showAvailability?: boolean;

  @IsBoolean()
  @IsOptional()
  acceptingNewStudents?: boolean;
}
