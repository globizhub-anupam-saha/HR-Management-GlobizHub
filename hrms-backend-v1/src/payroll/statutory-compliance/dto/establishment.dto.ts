import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateEstablishmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  epfoEstablishmentCode?: string;

  @IsString()
  @IsOptional()
  epfoExtension?: string;

  @IsString()
  @IsOptional()
  esicEmployerCode?: string;

  @IsDateString()
  @IsOptional()
  registrationDate?: string;
}

export class UpdateEstablishmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  epfoEstablishmentCode?: string;

  @IsString()
  @IsOptional()
  epfoExtension?: string;

  @IsString()
  @IsOptional()
  esicEmployerCode?: string;

  @IsDateString()
  @IsOptional()
  registrationDate?: string;
}

