import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
