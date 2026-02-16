import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsMongoId,
} from "class-validator";

export class CreateLessonDto {
  @IsMongoId()
  learnerId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  @Min(30)
  @Max(180)
  duration: number;

  @IsEnum(["standard", "test-prep", "mock-test", "motorway", "refresher"])
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @IsString()
  @IsOptional()
  dropoffLocation?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateLessonDto {
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @Min(30)
  @Max(180)
  @IsOptional()
  duration?: number;

  @IsEnum(["standard", "test-prep", "mock-test", "motorway", "refresher"])
  @IsOptional()
  type?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @IsString()
  @IsOptional()
  dropoffLocation?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  instructorNotes?: string;
}

export class LessonQueryDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @IsMongoId()
  @IsOptional()
  learnerId?: string;

  @IsEnum(["scheduled", "completed", "cancelled", "no-show"])
  @IsOptional()
  status?: string;

  @IsEnum(["pending", "paid", "refunded", "waived"])
  @IsOptional()
  paymentStatus?: string;
}

export class CancelLessonDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsEnum(["instructor", "learner", "system"])
  @IsOptional()
  cancelledBy?: string;
}

export class CompleteLessonDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
