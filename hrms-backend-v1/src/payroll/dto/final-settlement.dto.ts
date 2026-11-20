import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FinalSettlementDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsDateString()
  exitDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  noticeShortfallDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  additionalBonus?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  additionalDeductions?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
