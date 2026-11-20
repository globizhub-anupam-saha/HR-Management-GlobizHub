import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LeaveType } from '../../../generated/prisma/client';

export class AdjustLeaveBalanceDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsEnum(LeaveType)
  @IsNotEmpty()
  type: LeaveType;

  @IsNumber()
  @IsNotEmpty()
  amount: number; // e.g. +2 for comp-off credit, -1 for adjustment

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @IsOptional()
  year?: number;
}
