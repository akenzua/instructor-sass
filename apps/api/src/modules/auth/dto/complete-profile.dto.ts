import { IsString, IsOptional, MinLength, Matches } from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be in YYYY-MM-DD format' })
  dateOfBirth: string;

  @IsString()
  @MinLength(16, { message: 'UK driving licence number must be 16 characters' })
  provisionalLicenceNumber: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Test date must be in YYYY-MM-DD format' })
  testDate?: string;
}
