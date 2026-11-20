import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RequestCorrectionDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsDateString()
  requestedCheckIn?: string;

  @IsOptional()
  @IsDateString()
  requestedCheckOut?: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
