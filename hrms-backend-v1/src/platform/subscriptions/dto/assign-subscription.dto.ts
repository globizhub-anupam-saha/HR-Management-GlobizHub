import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AssignSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsOptional()
  @IsString()
  billingCycle?: 'MONTHLY' | 'ANNUAL' = 'MONTHLY';

  @IsOptional()
  @IsString()
  status?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' = 'ACTIVE';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  extensionDays?: number; // to extend current period / trial
}
