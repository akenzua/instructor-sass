import { IsString, IsOptional, IsNumber, Min } from "class-validator";

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
}
