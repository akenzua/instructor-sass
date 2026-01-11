import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Matches,
} from "class-validator";
import { Type } from "class-transformer";

class TimeSlotDto {
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:MM format",
  })
  start: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Time must be in HH:MM format",
  })
  end: string;
}

export class UpdateWeeklyAvailabilityDto {
  @IsEnum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ])
  dayOfWeek: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots: TimeSlotDto[];

  @IsBoolean()
  isAvailable: boolean;
}

export class CreateOverrideDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format",
  })
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  slots?: TimeSlotDto[];

  @IsBoolean()
  isAvailable: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class OverrideQueryDto {
  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  to?: string;
}
