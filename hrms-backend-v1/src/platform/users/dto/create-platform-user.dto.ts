import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';
import { PlatformRoleType } from '../../../../generated/prisma/enums';

export class CreatePlatformUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsIn([
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'BILLING_ADMIN',
    'SUPPORT_ADMIN',
    'PLATFORM_ANALYST',
  ])
  role: PlatformRoleType;
}
