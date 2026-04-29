import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString, MaxLength } from "class-validator";

export class CreateVehicleDto {
  @IsString()
  @MaxLength(100)
  make: string;

  @IsString()
  @MaxLength(100)
  model: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsString()
  @MaxLength(20)
  registration: string;

  @IsOptional()
  @IsEnum(["manual", "automatic", "both"])
  transmission?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  hasLearnerDualControls?: boolean;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @IsOptional()
  @IsDateString()
  motExpiry?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  make?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  registration?: string;

  @IsOptional()
  @IsEnum(["manual", "automatic", "both"])
  transmission?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  hasLearnerDualControls?: boolean;

  @IsOptional()
  @IsEnum(["active", "maintenance", "retired"])
  status?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiry?: string;

  @IsOptional()
  @IsDateString()
  motExpiry?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignVehicleDto {
  @IsString()
  instructorId: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
