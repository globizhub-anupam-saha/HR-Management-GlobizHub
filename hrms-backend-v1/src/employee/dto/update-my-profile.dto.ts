import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import {
  BloodGroup,
  Gender,
} from '../../../generated/prisma/client';

/**
 * S-01 fix: only the fields an employee is allowed to set on their own profile.
 * role, designationId, reportingManagerId, password, employmentStatus, companyId,
 * departmentId and employeeCode are deliberately absent.
 */
export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | '';

  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup | '';

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  personalEmail?: string;

  // Bank & statutory (encrypted at service layer)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ifscCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  panNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  pfAccountNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  uanNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  esicIpNumber?: string;

  // UI preferences
  @IsOptional()
  @IsString()
  @MaxLength(20)
  themePreference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  timeFormat?: string;
}
