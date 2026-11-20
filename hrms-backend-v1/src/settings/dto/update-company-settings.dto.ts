import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export class UpdateCompanySettingsDto {
  // General
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  companyLogo?: string;

  @IsString()
  @IsOptional()
  officeAddress?: string;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workingDays?: string[];

  @IsString()
  @IsOptional()
  fiscalYear?: string;

  // Attendance Configuration
  @IsString()
  @IsOptional()
  attendanceMethod?: string;

  @IsNumber()
  @IsOptional()
  officeLatitude?: number;

  @IsNumber()
  @IsOptional()
  officeLongitude?: number;

  @IsNumber()
  @IsOptional()
  allowedRadiusMeters?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  officeWifiSsids?: string[];

  @IsBoolean()
  @IsOptional()
  enableGps?: boolean;

  @IsBoolean()
  @IsOptional()
  enableWifi?: boolean;

  @IsBoolean()
  @IsOptional()
  enableMockLocation?: boolean;

  @IsBoolean()
  @IsOptional()
  oneDevicePerEmployee?: boolean;

  @IsBoolean()
  @IsOptional()
  allowMultiPunch?: boolean;

  @IsBoolean()
  @IsOptional()
  enableSplitShifts?: boolean;

  // Shift Settings
  @IsString()
  @IsOptional()
  officeStartTime?: string;

  @IsString()
  @IsOptional()
  officeEndTime?: string;

  @IsNumber()
  @IsOptional()
  gracePeriodMinutes?: number;

  @IsNumber()
  @Min(1)
  @Max(24)
  @IsOptional()
  minimumHoursForFullDay?: number;

  @IsNumber()
  @Min(0.5)
  @Max(12)
  @IsOptional()
  halfDayMinHours?: number;

  // Leave Defaults
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultCasualLeaves?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultSickLeaves?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultEarnedLeaves?: number;

  // Security & Notifications
  @IsBoolean()
  @IsOptional()
  allowMultipleDevices?: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
  sessionTimeoutHours?: number;

  @IsBoolean()
  @IsOptional()
  auditLogsEnabled?: boolean;

  // Resignation & Notice Period Policy
  @IsNumber()
  @Min(0)
  @IsOptional()
  noticePeriodDays?: number;

  @IsBoolean()
  @IsOptional()
  isIpRestrictionOn?: boolean;

  @IsString()
  @IsOptional()
  officeIpAddress?: string;

  // Corporate Identity
  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  incorporationDate?: string;

  // Contact & Location
  @IsString()
  @IsOptional()
  officialEmail?: string;

  @IsString()
  @IsOptional()
  officialPhone?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  // Theme & Appearance
  @IsString()
  @IsOptional()
  themeColor?: string;

  @IsString()
  @IsOptional()
  payslipHeaderUrl?: string;

  @IsBoolean()
  @IsOptional()
  overtimeIncludesShiftSwaps?: boolean;

  // Employee ID Format Configuration
  @IsString()
  @IsOptional()
  employeeIdFormat?: string;

  @IsString()
  @IsOptional()
  employeeIdPrefix?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  employeeIdDigits?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  employeeIdCounter?: number;

  // Pay Cycle Configuration
  @IsString()
  @IsOptional()
  payCycleType?: string;

  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  payCycleStartDay?: number;

  @IsNumber()
  @Min(0)
  @Max(31)
  @IsOptional()
  payCycleEndDay?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  nightShiftAllowanceRate?: number;
}
