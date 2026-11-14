import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { EmployeeRole } from '../../../generated/prisma/client'; // Import the strict enum from Prisma!

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(EmployeeRole)
  role?: EmployeeRole;

  @IsOptional()
  @IsString()
  designationId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  reportingManagerId?: string;

  @IsOptional()
  @IsString()
  employeeCode?: string | null;

  @IsOptional()
  @IsString()
  uanNumber?: string;

  @IsOptional()
  @IsString()
  esicIpNumber?: string;

  @IsOptional()
  @IsString()
  establishmentId?: string;
}
