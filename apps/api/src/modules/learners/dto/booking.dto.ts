import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsDateString,
  IsEnum,
  Min,
  Max,
} from "class-validator";

export class BookLessonDto {
  @IsDateString()
  startTime: string;

  @IsNumber()
  @Min(30)
  @Max(240)
  duration: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsMongoId()
  @IsOptional()
  instructorId?: string;

  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class BookPackageDto {
  @IsMongoId()
  packageId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
