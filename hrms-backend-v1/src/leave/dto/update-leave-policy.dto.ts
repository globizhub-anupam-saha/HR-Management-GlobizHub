import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { LeaveType, PeriodType } from '../../../generated/prisma/client';

export class UpdateLeavePolicyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(LeaveType)
  @IsOptional()
  type?: LeaveType;

  @IsNumber()
  @IsOptional()
  daysPerYear?: number;

  @IsEnum(PeriodType)
  @IsOptional()
  periodType?: PeriodType;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  carryForward?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;
}
