import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { CredentialType } from '../../../generated/prisma/enums';

export class UpdateCredentialDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(CredentialType)
  @IsOptional()
  credentialType?: CredentialType;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  issuingAuthority?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsBoolean()
  @IsOptional()
  doesNotExpire?: boolean;

  @IsString()
  @IsOptional()
  documentUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
