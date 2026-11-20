import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewCorrectionDto {
  @IsNotEmpty()
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  reviewerNote?: string;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
