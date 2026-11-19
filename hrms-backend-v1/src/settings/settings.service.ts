import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

const ALLOWED_SETTINGS_FIELDS = new Set([
  'companyName',
  'companyLogo',
  'officeAddress',
  'timeZone',
  'workingDays',
  'fiscalYear',
  'attendanceMethod',
  'officeLatitude',
  'officeLongitude',
  'allowedRadiusMeters',
  'officeWifiSsids',
  'enableGps',
  'enableWifi',
  'enableMockLocation',
  'oneDevicePerEmployee',
  'allowMultiPunch',
  'enableSplitShifts',
  'officeStartTime',
  'officeEndTime',
  'gracePeriodMinutes',
  'minimumHoursForFullDay',
  'halfDayMinHours',
  'defaultCasualLeaves',
  'defaultSickLeaves',
  'defaultEarnedLeaves',
  'allowMultipleDevices',
  'sessionTimeoutHours',
  'auditLogsEnabled',
  'noticePeriodDays',
  'isIpRestrictionOn',
  'officeIpAddress',
  'legalName',
  'industry',
  'registrationNumber',
  'taxId',
  'website',
  'incorporationDate',
  'officialEmail',
  'officialPhone',
  'city',
  'state',
  'country',
  'zipCode',
  'themeColor',
  'payslipHeaderUrl',
  'overtimeIncludesShiftSwaps',
  'employeeIdFormat',
  'employeeIdPrefix',
  'employeeIdDigits',
  'employeeIdCounter',
  'payCycleType',
  'payCycleStartDay',
  'payCycleEndDay',
  'nightShiftAllowanceRate',
]);

const NUMERIC_FIELDS = new Set([
  'officeLatitude',
  'officeLongitude',
  'allowedRadiusMeters',
  'gracePeriodMinutes',
  'minimumHoursForFullDay',
  'halfDayMinHours',
  'defaultCasualLeaves',
  'defaultSickLeaves',
  'defaultEarnedLeaves',
  'sessionTimeoutHours',
  'noticePeriodDays',
  'employeeIdDigits',
  'employeeIdCounter',
  'payCycleStartDay',
  'payCycleEndDay',
  'nightShiftAllowanceRate',
]);

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // Get company settings (auto-creates default if missing)
  async getSettings(companyId: string) {
    let settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });

    if (!settings) {
      settings = await this.prisma.companySettings.create({
        data: {
          companyId,
          workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        },
      });
    }

    return settings;
  }

  // Update company settings (restricted to Admin/HR/Owner)
  async updateSettings(
    companyId: string,
    dto: UpdateCompanySettingsDto | any,
    userRole: string,
    actorId?: string,
  ) {
    if (
      userRole !== 'SUPER_ADMIN' &&
      userRole !== 'OWNER' &&
      userRole !== 'HR_HEAD' &&
      userRole !== 'MANAGER'
    ) {
      throw new ForbiddenException(
        'Only Admins or Managers can modify system settings.',
      );
    }

    const oldSettings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });

    // Sanitize and whitelist fields to prevent Prisma unknown argument crashes
    const sanitizedData: Record<string, any> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (!ALLOWED_SETTINGS_FIELDS.has(key) || value === undefined) {
        continue;
      }

      // Convert numeric fields if passed as strings from form inputs
      if (NUMERIC_FIELDS.has(key)) {
        if (value === null || value === '') {
          sanitizedData[key] = null;
        } else {
          const num = Number(value);
          sanitizedData[key] = isNaN(num) ? value : num;
        }
        continue;
      }

      // Normalize working days to uppercase for consistent engine calculations
      if (key === 'workingDays' && Array.isArray(value)) {
        sanitizedData.workingDays = value
          .filter((d) => typeof d === 'string' && d.trim().length > 0)
          .map((d: string) => d.toUpperCase());
        continue;
      }

      sanitizedData[key] = value;
    }

    // Use UPSERT for safety: Update if it exists, create if missing
    const newSettings = await this.prisma.companySettings.upsert({
      where: { companyId },
      update: sanitizedData,
      create: {
        companyId,
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        ...sanitizedData,
      },
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'CompanySettings',
      newSettings.id,
      oldSettings,
      newSettings,
    );

    return newSettings;
  }
}
