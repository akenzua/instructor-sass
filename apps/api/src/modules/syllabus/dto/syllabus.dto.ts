import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

// ============================================================================
// Syllabus Topic DTO
// ============================================================================

export class SyllabusTopicDto {
  @IsInt()
  @Min(1)
  order: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  category: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keySkills?: string[];
}

// ============================================================================
// Create / Update Syllabus
// ============================================================================

export class CreateSyllabusDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyllabusTopicDto)
  topics: SyllabusTopicDto[];
}

export class UpdateSyllabusDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyllabusTopicDto)
  @IsOptional()
  topics?: SyllabusTopicDto[];
}

// ============================================================================
// Score a Topic (after a lesson)
// ============================================================================

export class ScoreTopicDto {
  @IsString()
  lessonId: string;

  @IsString()
  learnerId: string;

  @IsInt()
  @Min(1)
  topicOrder: number;

  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

// ============================================================================
// Complete (mark mastered) a Topic
// ============================================================================

export class CompleteTopicDto {
  @IsString()
  learnerId: string;

  @IsInt()
  @Min(1)
  topicOrder: number;
}

// ============================================================================
// Initialise learner progress from a syllabus
// ============================================================================

export class InitProgressDto {
  @IsString()
  learnerId: string;

  @IsString()
  @IsOptional()
  syllabusId?: string; // defaults to instructor's default syllabus
}
