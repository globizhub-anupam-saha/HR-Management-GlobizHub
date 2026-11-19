import api from "../api";

export interface CompanySettings {
  id?: string;
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  officeAddress?: string;
  timeZone?: string;
  workingDays?: string[];
  fiscalYear?: string;
  attendanceMethod?: string;
  officeLatitude?: number | null;
  officeLongitude?: number | null;
  allowedRadiusMeters?: number;
  officeWifiSsids?: string[];
  enableGps?: boolean;
  enableWifi?: boolean;
  enableMockLocation?: boolean;
  oneDevicePerEmployee?: boolean;
  allowMultiPunch?: boolean;
  enableSplitShifts?: boolean;
  officeStartTime?: string;
  officeEndTime?: string;
  gracePeriodMinutes?: number;
  minimumHoursForFullDay?: number;
  halfDayMinHours?: number;
  defaultCasualLeaves?: number;
  defaultSickLeaves?: number;
  defaultEarnedLeaves?: number;
  allowMultipleDevices?: boolean;
  sessionTimeoutHours?: number;
  auditLogsEnabled?: boolean;
  noticePeriodDays?: number;
  isIpRestrictionOn?: boolean;
  officeIpAddress?: string;
  legalName?: string;
  industry?: string;
  registrationNumber?: string;
  taxId?: string;
  website?: string;
  incorporationDate?: string;
  officialEmail?: string;
  officialPhone?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  themeColor?: string;
  payslipHeaderUrl?: string;
  overtimeIncludesShiftSwaps?: boolean;
  employeeIdFormat?: string;
  employeeIdPrefix?: string;
  employeeIdDigits?: number;
  employeeIdCounter?: number;
  payCycleType?: string;
  payCycleStartDay?: number;
  payCycleEndDay?: number;
  nightShiftAllowanceRate?: number;
}

export const settingsApi = {
  getSettings: async (): Promise<CompanySettings> => {
    const res = await api.get("/settings");
    return res.data;
  },

  updateSettings: async (
    data: Partial<CompanySettings>,
  ): Promise<CompanySettings> => {
    const res = await api.patch("/settings", data);
    return res.data;
  },

  uploadPayslipHeader: async (
    formData: FormData,
  ): Promise<{ fileUrl: string }> => {
    const res = await api.post("/documents/payslip-letterhead", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

