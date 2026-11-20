import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { TicketStatus } from '../../../../generated/prisma/enums';

export class ReplyTicketDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'])
  status?: TicketStatus;
}
