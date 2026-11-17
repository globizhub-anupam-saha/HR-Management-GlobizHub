import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvitedEmployeeDto {
  @IsString() @IsOptional() firstName?: string;
  @IsString() @IsOptional() lastName?: string;
  @IsEmail() email: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() department?: string;
  @IsString() @IsOptional() designation?: string;
  @IsString() @IsOptional() role?: string;
}

export class BranchDetailDto {
  @IsString() name: string;
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() state?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() address?: string;
  @IsOptional() isHeadquarters?: boolean;
}

export class RegisterWizardDto {
  @IsString() companyName: string;
  @IsString() @IsOptional() industry?: string;
  @IsString() @IsOptional() companySize?: string;
  @IsEmail() email: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() website?: string;

  // Missing Company Details
  @IsString() @IsOptional() gstin?: string;
  @IsString() @IsOptional() pan?: string;
  @IsString() @IsOptional() cin?: string;

  // Missing Admin Details
  @IsString() adminFirstName: string;
  @IsString() adminLastName: string;
  @IsEmail() adminEmail: string;
  @IsString() @IsOptional() adminPhone?: string;
  @IsString() @IsOptional() adminPassword?: string;
  @IsString() @IsOptional() timeZone?: string;

  @IsArray() @IsString({ each: true }) @IsOptional() departments?: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() roles?: string[];
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  salaryComponents?: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() leavePolicies?: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() shifts?: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() branches?: string[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BranchDetailDto)
  @IsOptional()
  branchDetails?: BranchDetailDto[];

  @IsString() @IsOptional() holidayRegion?: string;
  @IsString() @IsOptional() inviteEmails?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvitedEmployeeDto)
  @IsOptional()
  invitedEmployees?: InvitedEmployeeDto[];

  @IsString() @IsOptional() themeColor?: string;
  @IsArray() @IsString({ each: true }) @IsOptional() workDays?: string[];
  @IsString() @IsOptional() shiftStartTime?: string;
  @IsString() @IsOptional() shiftEndTime?: string;
  @IsString() @IsOptional() attendanceMethod?: string;
  @IsString() @IsOptional() employeeIdFormat?: string;
  @IsString() @IsOptional() employeeIdPrefix?: string;
  @IsOptional() employeeIdDigits?: number;
}
