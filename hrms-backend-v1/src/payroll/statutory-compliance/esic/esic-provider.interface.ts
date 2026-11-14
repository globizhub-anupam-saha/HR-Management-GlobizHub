export interface EsicMemberRecord {
  ipNumber: string;
  ipName: string;
  noOfDaysWagesPaid: number;
  totalMonthlyWages: number;
  reasonForZeroWages: number; // 0 if worked, or ESIC reason code
  lastWorkingDay?: string; // DD/MM/YYYY
  eeContribution: number;
  erContribution: number;
  totalContribution: number;
}

export interface EsicGenerationResult {
  content: string; // The portal-compatible formatted text/csv
  memberCount: number;
  totalWages: number;
  totalEeContribution: number;
  totalErContribution: number;
  grandTotal: number;
}

export interface ESICProvider {
  /**
   * Future Phase 2/3: Upload monthly contribution through authorized ESIC API
   */
  uploadContribution?(filePath: string, employerCode: string): Promise<{ success: boolean; challanNumber?: string; message: string }>;
  fetchChallanStatus?(challanNumber: string): Promise<{ status: string; paidDate?: Date }>;
}

