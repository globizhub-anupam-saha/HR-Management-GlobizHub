import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class UpsertTaxDeclarationDto {
  @IsString()
  @IsNotEmpty()
  financialYear: string; // e.g., "2026-2027"

  @IsString()
  @IsIn(['OLD', 'NEW'])
  regime: 'OLD' | 'NEW';

  @IsOptional()
  @IsNumber()
  section80C?: number;

  @IsOptional()
  section80CDetails?: any;

  @IsOptional()
  @IsNumber()
  section80D?: number;

  @IsOptional()
  section80DDetails?: any;

  @IsOptional()
  @IsNumber()
  section24b?: number;

  @IsOptional()
  @IsNumber()
  section80E?: number;

  @IsOptional()
  @IsNumber()
  section80G?: number;

  @IsOptional()
  @IsNumber()
  otherExemptions?: number;

  @IsOptional()
  @IsNumber()
  annualRentPaid?: number;

  @IsOptional()
  @IsString()
  landlordPan?: string;

  @IsOptional()
  @IsString()
  landlordName?: string;

  @IsOptional()
  @IsString()
  rentalAddress?: string;

  @IsOptional()
  @IsBoolean()
  isMetro?: boolean;

  @IsOptional()
  proofDocuments?: any[];

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'SUBMITTED'])
  status?: string;
}

export class VerifyTaxDeclarationDto {
  @IsString()
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

