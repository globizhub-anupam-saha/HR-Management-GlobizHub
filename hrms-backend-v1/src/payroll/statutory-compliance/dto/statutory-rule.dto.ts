import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertStatutoryRuleDto {
  @IsString()
  @IsNotEmpty()
  establishmentId: string;

  @IsString()
  @IsNotEmpty()
  category: string; // 'EPF', 'EPS', 'EDLI', 'EPF_ADMIN', 'ESI_EE', 'ESI_ER'

  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  rate: number; // Decimal (e.g. 0.12 for 12%, 0.0833 for 8.33%)

  @IsDateString()
  effectiveFrom: string;

  @IsDateString()
  @IsOptional()
  effectiveTo?: string;
}

