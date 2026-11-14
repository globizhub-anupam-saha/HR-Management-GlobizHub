import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * S-17: Typed DTO that replaces raw `body: any` for salary-structure writes.
 * Only numeric salary fields are accepted; no schema-level fields (companyId,
 * employeeId) can be injected from the request body.
 */
export class UpsertSalaryStructureDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  annualCTC?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  basicSalary: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hra: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  conveyanceAllowance: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  medicalAllowance: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  specialAllowance: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pfContribution: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxDeduction: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  professionalTax: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  otherAllowances?: number;

  @IsOptional()
  customComponents?: any;
}

