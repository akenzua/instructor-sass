import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from "class-validator";

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  lessonCount: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  lessonCount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
