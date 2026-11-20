import { IsOptional, IsString } from 'class-validator';

export class QueryEmployeesDto {
  @IsOptional()
  @IsString()
  status?: string; // 'ALL' | 'ACTIVE' | 'INVITED' | 'ONBOARDING' | 'NOTICE_PERIOD' | 'TERMINATED' | 'RESIGNED'

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
