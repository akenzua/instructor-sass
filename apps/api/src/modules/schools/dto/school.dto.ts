import { IsString, IsEmail, IsOptional, MaxLength } from "class-validator";

export class CreateSchoolDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postcode?: string;
  };

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string;
}

export class UpdateSchoolDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postcode?: string;
  };

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string;
}

export class InviteInstructorDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role?: 'admin' | 'instructor';
}

export class UpdateInstructorRoleDto {
  @IsString()
  role: "admin" | "instructor";
}
