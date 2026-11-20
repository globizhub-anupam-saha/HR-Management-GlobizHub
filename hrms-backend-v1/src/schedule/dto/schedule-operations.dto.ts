import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class BulkAssignScheduleDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employeeIds?: string[];

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsBoolean()
  isDayOff?: boolean;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @IsOptional()
  @IsBoolean()
  overrideConflict?: boolean;

  @IsOptional()
  @IsString()
  overrideReason?: string;
}

export class RotationPatternStepDto {
  @IsOptional()
  @IsString()
  shiftId?: string | null;

  @IsOptional()
  @IsBoolean()
  isDayOff?: boolean;
}

export class ApplyRotationPatternDto {
  @IsArray()
  @IsString({ each: true })
  employeeIds: string[];

  @IsDateString()
  startDate: string;

  @IsInt()
  @Min(1)
  @Max(52)
  cycles: number; // Number of times the pattern repeats

  @IsArray()
  pattern: RotationPatternStepDto[];

  @IsOptional()
  @IsBoolean()
  overrideConflict?: boolean;

  @IsOptional()
  @IsString()
  overrideReason?: string;
}

export class QueryRosterMatrixDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;
}
