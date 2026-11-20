import {
  IsBoolean,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string; // e.g. "PLAN_PRO", "PLAN_ENTERPRISE"

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualPrice: number;

  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxEmployees: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxStorageGb?: number = 5;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  trialDays?: number = 14;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;
}
