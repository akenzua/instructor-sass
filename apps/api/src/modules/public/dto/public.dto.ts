import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDateString } from "class-validator";

export class BookLessonDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  learnerFirstName: string;

  @IsString()
  @IsNotEmpty()
  learnerLastName: string;

  @IsEmail()
  learnerEmail: string;

  @IsString()
  @IsOptional()
  learnerPhone?: string;

  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class PurchasePackageDto {
  @IsString()
  @IsNotEmpty()
  packageId: string;

  @IsString()
  @IsNotEmpty()
  learnerFirstName: string;

  @IsString()
  @IsNotEmpty()
  learnerLastName: string;

  @IsEmail()
  learnerEmail: string;

  @IsString()
  @IsOptional()
  learnerPhone?: string;
}

export class GetAvailableSlotsDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
