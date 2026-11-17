import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendRegistrationOtpDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email address cannot be empty' })
  email: string;
}
