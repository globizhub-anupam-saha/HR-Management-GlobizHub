import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { EmployeeRole } from '../../../generated/prisma/client'; // Import the strict enum from Prisma!

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  // Validate that the incoming string exactly matches one of your Prisma Enum values
  @IsEnum(EmployeeRole)
  @IsNotEmpty()
  role: EmployeeRole;

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
  uanNumber?: string;

  @IsOptional()
  @IsString()
  esicIpNumber?: string;

  @IsOptional()
  @IsString()
  establishmentId?: string;
}
