import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { TicketPriority } from '../../../../generated/prisma/enums';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority: TicketPriority;

  @IsString()
  @IsNotEmpty()
  initialMessage: string;
}
