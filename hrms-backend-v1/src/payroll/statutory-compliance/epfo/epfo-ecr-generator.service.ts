import { Injectable, BadRequestException } from '@nestjs/common';
import { EcrMemberRecord, EcrGenerationResult } from './epfo-provider.interface';

@Injectable()
export class EpfoEcrGeneratorService {
  /**
   * Generates the official EPFO Revamped ECR .txt file content using the '#~#' delimiter.
   * Field sequence per EPFO specification:
   * 1. UAN (12 digits)
   * 2. Member Name (Alphabetical, max 80 chars)
   * 3. Gross Wages
   * 4. EPF Wages
   * 5. EPS Wages
   * 6. EDLI Wages
   * 7. EPF Contribution Remitted (EE share)
   * 8. EPS Contribution Remitted (ER share)
   * 9. EPF EPS Difference Remitted (ER share diff)
   * 10. NCP Days (Non-contributing period)
   * 11. Refund of Advances
   */
  generateEcrText(records: EcrMemberRecord[]): EcrGenerationResult {
    if (!records || records.length === 0) {
      throw new BadRequestException('No eligible EPFO employee records found for ECR generation');
    }

    const lines: string[] = [];

    let totalGrossWages = 0;
    let totalEpfWages = 0;
    let totalEpsWages = 0;
    let totalEdliWages = 0;
    let totalEeEpf = 0;
    let totalErEps = 0;
    let totalErEpfDiff = 0;

    for (const record of records) {
      // Validate UAN format (must be 12 digits for official ECR upload)
      const cleanUan = (record.uan || '').trim();
      if (!cleanUan || cleanUan.length !== 12 || !/^\d+$/.test(cleanUan)) {
        throw new BadRequestException(
          `Invalid UAN '${record.uan}' for employee ${record.memberName}. EPFO requires a valid 12-digit UAN.`,
        );
      }

      // Sanitize member name (remove special characters that break EPFO parser)
      const cleanName = record.memberName.replace(/[^a-zA-Z\s.]/g, '').trim().substring(0, 80);

      totalGrossWages += record.grossWages;
      totalEpfWages += record.epfWages;
      totalEpsWages += record.epsWages;
      totalEdliWages += record.edliWages;
      totalEeEpf += record.eeEpfShare;
      totalErEps += record.erEpsShare;
      totalErEpfDiff += record.erEpfDiff;

      const fields = [
        cleanUan,
        cleanName,
        record.grossWages.toString(),
        record.epfWages.toString(),
        record.epsWages.toString(),
        record.edliWages.toString(),
        record.eeEpfShare.toString(),
        record.erEpsShare.toString(),
        record.erEpfDiff.toString(),
        record.ncpDays.toString(),
        record.refundOfAdvances.toString(),
      ];

      lines.push(fields.join('#~#'));
    }

    // Account 2: EPF Admin charges (0.50% of EPF wages, minimum Rs. 500 per establishment)
    const rawAdminCharges = Math.round(totalEpfWages * 0.005);
    const totalAdminCharges = Math.max(500, rawAdminCharges);

    // Account 21: EDLI Contribution (0.50% of EDLI wages)
    const totalEdliContribution = Math.round(totalEdliWages * 0.005);

    // Total challan deposit amount = EE EPF + ER EPF Diff + EPS + Admin + EDLI
    const grandTotal = totalEeEpf + totalErEpfDiff + totalErEps + totalAdminCharges + totalEdliContribution;

    return {
      content: lines.join('\r\n'),
      memberCount: records.length,
      totalGrossWages,
      totalEpfWages,
      totalEpsWages,
      totalEdliWages,
      totalEeEpf,
      totalErEps,
      totalErEpfDiff,
      totalAdminCharges,
      totalEdliContribution,
      grandTotal,
    };
  }
}

