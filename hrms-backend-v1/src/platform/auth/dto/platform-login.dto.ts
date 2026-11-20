import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PlatformLoginDto {
  @IsEmail({}, { message: 'A valid email is required' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
