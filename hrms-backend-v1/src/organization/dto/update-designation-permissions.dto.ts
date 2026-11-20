import { IsArray, IsOptional, IsObject, IsString } from 'class-validator';

export class UpdateDesignationPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sidebarModules?: string[];

  @IsObject()
  @IsOptional()
  modulePermissions?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dashboardWidgets?: string[];
}
