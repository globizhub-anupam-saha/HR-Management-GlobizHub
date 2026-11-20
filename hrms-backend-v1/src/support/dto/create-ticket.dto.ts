import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';

export enum TicketCategory {
  HR = 'HR',
  IT = 'IT',
  PAYROLL = 'PAYROLL',
  FACILITIES = 'FACILITIES',
  GENERAL = 'GENERAL',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsEnum(TicketCategory)
  category: TicketCategory;

  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}
