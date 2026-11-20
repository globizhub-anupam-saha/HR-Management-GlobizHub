import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PlatformRoleType } from '../../../../generated/prisma/enums';

export class PlatformRegisterDto {
  @IsEmail({}, { message: 'A valid email is required' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsEnum(PlatformRoleType)
  @IsOptional()
  role?: PlatformRoleType;
}
