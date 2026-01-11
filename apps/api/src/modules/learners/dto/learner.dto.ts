import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

class AddressDto {
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

export class CreateLearnerDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsDateString()
  @IsOptional()
  testDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(["active", "inactive", "archived"])
  @IsOptional()
  status?: string;
}

export class UpdateLearnerDto {
  @IsEmail()
  @IsOptional()
  email?: string;

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
  dateOfBirth?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsDateString()
  @IsOptional()
  testDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(["active", "inactive", "archived"])
  @IsOptional()
  status?: string;
}

export class LearnerQueryDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsEnum(["active", "inactive", "archived"])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
