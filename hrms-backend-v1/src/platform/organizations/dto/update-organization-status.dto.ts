import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationStatusDto {
  @IsNotEmpty()
  @IsIn(['VERIFIED', 'ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
  status: 'VERIFIED' | 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

  @IsOptional()
  @IsString()
  reason?: string;
}
