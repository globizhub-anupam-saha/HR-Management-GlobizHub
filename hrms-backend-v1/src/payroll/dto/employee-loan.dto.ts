import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
} from 'class-validator';

export class CreateLoanDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsIn(['SALARY_ADVANCE', 'PERSONAL_LOAN', 'EMERGENCY_LOAN'])
  type: string;

  @IsNumber()
  @Min(100)
  principalAmount: number;

  @IsOptional()
  @IsNumber()
  interestRate?: number; // annual rate % (default 0)

  @IsNumber()
  @Min(1)
  tenureMonths: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  deductionStartMonth?: number;

  @IsOptional()
  @IsNumber()
  deductionStartYear?: number;
}

export class UpdateLoanStatusDto {
  @IsString()
  @IsIn(['APPROVED', 'ACTIVE', 'PAID_OFF', 'REJECTED'])
  status: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

