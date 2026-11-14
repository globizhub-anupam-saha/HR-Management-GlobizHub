import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyCredentialDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['VERIFIED', 'REJECTED'])
  status: 'VERIFIED' | 'REJECTED';

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

