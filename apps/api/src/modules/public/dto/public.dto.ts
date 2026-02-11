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

export class SearchInstructorsDto {
  @IsString()
  @IsOptional()
  query?: string; // Search by name, area, postcode

  @IsString()
  @IsOptional()
  location?: string; // Filter by location/postcode

  @IsString()
  @IsOptional()
  radius?: string; // Search radius in miles (default: 10)

  @IsString()
  @IsOptional()
  lat?: string; // Latitude for geo search (alternative to location)

  @IsString()
  @IsOptional()
  lng?: string; // Longitude for geo search (alternative to location)

  @IsString()
  @IsOptional()
  transmission?: string; // 'manual' | 'automatic' | 'both'

  @IsString()
  @IsOptional()
  minRating?: string; // Minimum rating (1-5)

  @IsString()
  @IsOptional()
  maxPrice?: string; // Maximum hourly rate

  @IsString()
  @IsOptional()
  minPassRate?: string; // Minimum pass rate percentage

  @IsString()
  @IsOptional()
  minExperience?: string; // Minimum years of experience

  @IsString()
  @IsOptional()
  acceptingStudents?: string; // 'true' or 'false'

  @IsString()
  @IsOptional()
  specializations?: string; // Comma-separated specializations

  @IsString()
  @IsOptional()
  languages?: string; // Comma-separated languages

  @IsString()
  @IsOptional()
  sortBy?: string; // 'rating' | 'price' | 'experience' | 'passRate'

  @IsString()
  @IsOptional()
  sortOrder?: string; // 'asc' | 'desc'

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;
}
