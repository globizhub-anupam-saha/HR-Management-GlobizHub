import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateCtcDto {
  @IsNumber()
  @Min(50000)
  @Type(() => Number)
  annualCTC: number;

  @IsOptional()
  @IsBoolean()
  isMetro?: boolean;

  @IsOptional()
  @IsBoolean()
  optOutPF?: boolean;
}
