import { IsOptional, IsString } from 'class-validator';

export class QueryAttendanceRecordsDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
