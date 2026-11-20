import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsIn,
} from 'class-validator';

export class RecordPaymentDto {
  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsString()
  @IsIn(['STRIPE', 'RAZORPAY', 'MANUAL_BANK'])
  gateway: string;

  @IsString()
  @IsOptional()
  gatewayPaymentId?: string;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @IsString()
  @IsIn(['SUCCEEDED', 'PENDING', 'FAILED', 'REFUNDED'])
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED';

  @IsString()
  @IsOptional()
  failureReason?: string;
}
