import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EntitlementItemDto {
  @IsString()
  @IsNotEmpty()
  moduleKey: string;

  @IsBoolean()
  isEnabled: boolean;
}

export class UpdateEntitlementsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntitlementItemDto)
  entitlements: EntitlementItemDto[];
}
