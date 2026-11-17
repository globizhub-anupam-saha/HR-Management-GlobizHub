import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyRegistrationOtpDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email address cannot be empty' })
  email: string;

  @IsNotEmpty({ message: 'Verification code cannot be empty' })
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  otp: string;
}
