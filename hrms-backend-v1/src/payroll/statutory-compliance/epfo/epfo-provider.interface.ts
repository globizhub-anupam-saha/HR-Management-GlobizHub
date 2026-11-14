export interface EcrMemberRecord {
  uan: string;
  memberName: string;
  grossWages: number;
  epfWages: number;
  epsWages: number;
  edliWages: number;
  eeEpfShare: number;
  erEpsShare: number;
  erEpfDiff: number;
  ncpDays: number;
  refundOfAdvances: number;
}

export interface EcrGenerationResult {
  content: string; // The raw .txt format with #~# delimiter
  memberCount: number;
  totalGrossWages: number;
  totalEpfWages: number;
  totalEpsWages: number;
  totalEdliWages: number;
  totalEeEpf: number;
  totalErEps: number;
  totalErEpfDiff: number;
  totalAdminCharges: number;
  totalEdliContribution: number;
  grandTotal: number;
}

export interface EPFOProvider {
  /**
   * Future Phase 2/3: Upload ECR file through authorized EPFO API
   */
  uploadEcr?(filePath: string, establishmentCode: string): Promise<{ success: boolean; trrn?: string; message: string }>;
  fetchChallanStatus?(trrn: string): Promise<{ status: string; paidDate?: Date }>;
}

