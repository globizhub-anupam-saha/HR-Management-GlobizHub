import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class UpsertEmployeeStatutoryProfileDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  establishmentId: string;

  @IsString()
  @IsOptional()
  epfoUan?: string;

  @IsString()
  @IsOptional()
  esicIpNumber?: string;

  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @IsDateString()
  @IsOptional()
  effectiveTo?: string;
}

