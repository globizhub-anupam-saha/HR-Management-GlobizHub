import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @IsNumber()
  @Min(0)
  amountDue: number;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
