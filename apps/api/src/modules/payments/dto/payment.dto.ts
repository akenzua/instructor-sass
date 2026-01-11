import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsMongoId,
  Min,
} from "class-validator";

export class CreatePaymentIntentDto {
  @IsMongoId()
  learnerId: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  lessonIds?: string[];

  @IsMongoId()
  @IsOptional()
  packageId?: string;

  @IsNumber()
  @Min(0.5)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
