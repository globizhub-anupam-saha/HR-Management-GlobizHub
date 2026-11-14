import { IsString, IsNotEmpty, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateStatutoryDto {
  @IsString()
  @IsNotEmpty()
  establishmentId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  year: number;

  @IsString()
  @IsIn(['ALL', 'PF', 'ESI'])
  type: 'ALL' | 'PF' | 'ESI' = 'ALL';
}

export class GenerateStatutoryFileDto {
  @IsString()
  @IsNotEmpty()
  establishmentId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  year: number;

  @IsString()
  @IsIn(['PF', 'ESI'])
  type: 'PF' | 'ESI';
}

export class SubmitStatutoryReturnDto {
  @IsString()
  @IsNotEmpty()
  returnId: string;

  @IsString()
  @IsNotEmpty()
  portalReference: string; // Portal acknowledgment/ECR reference

  @IsString()
  @IsNotEmpty()
  documentPath: string; // S3 or storage path of portal acknowledgment PDF
}

export class CreateChallanDto {
  @IsString()
  @IsNotEmpty()
  returnId: string;

  @IsString()
  @IsNotEmpty()
  challanNumber: string;

  @IsString()
  @IsNotEmpty()
  trrn: string;

  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  dueDate: string;
}

export class RecordStatutoryPaymentDto {
  @IsString()
  @IsNotEmpty()
  challanId: string;

  @IsString()
  @IsNotEmpty()
  paymentReference: string; // Official bank / EPFO / ESIC transaction reference

  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentDate: string;

  @IsString()
  @IsNotEmpty()
  method: string; // 'NET_BANKING' | 'NEFT_RTGS' | 'PORTAL_GATEWAY' | 'OTHER'

  @IsString()
  @IsNotEmpty()
  receiptPath: string; // Uploaded receipt PDF
}

