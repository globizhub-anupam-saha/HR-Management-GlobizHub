import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateAccessSessionDto {
  @IsString()
  @IsNotEmpty({
    message:
      'A clear reason is required to initiate a controlled support session',
  })
  reason: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  durationMinutes?: number = 60;
}
