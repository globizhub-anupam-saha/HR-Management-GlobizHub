import { Injectable, BadRequestException } from '@nestjs/common';
import { EsicMemberRecord, EsicGenerationResult } from './esic-provider.interface';

@Injectable()
export class EsicFileGeneratorService {
  /**
   * Generates the ESIC Monthly Contribution upload file formatted strictly per ESIC employer portal requirements.
   * Fields: IP_NUMBER,IP_NAME,NO_OF_DAYS,TOTAL_MONTHLY_WAGES,REASON_FOR_ZERO_WAGES,LAST_WORKING_DAY
   */
  generateEsicContributionFile(records: EsicMemberRecord[]): EsicGenerationResult {
    if (!records || records.length === 0) {
      throw new BadRequestException('No eligible ESIC insured person records found');
    }

    const lines: string[] = [];
    // ESIC Portal upload specification
    lines.push('IP Number,IP Name,No of Days for which wages paid,Total Monthly Wages,Reason Code for Zero wages,Last Working Day');

    let totalWages = 0;
    let totalEeContribution = 0;
    let totalErContribution = 0;

    for (const record of records) {
      const cleanIp = (record.ipNumber || '').trim();
      if (!cleanIp || !/^\d+$/.test(cleanIp)) {
        throw new BadRequestException(
          `Invalid ESIC IP Number '${record.ipNumber}' for member ${record.ipName}. Must be a valid numeric IP Number.`,
        );
      }

      const cleanName = record.ipName.replace(/[,\r\n]/g, '').trim().substring(0, 80);

      totalWages += record.totalMonthlyWages;
      totalEeContribution += record.eeContribution;
      totalErContribution += record.erContribution;

      const row = [
        cleanIp,
        cleanName,
        record.noOfDaysWagesPaid.toString(),
        record.totalMonthlyWages.toString(),
        record.reasonForZeroWages.toString(),
        record.lastWorkingDay || '',
      ];

      lines.push(row.join(','));
    }

    const grandTotal = totalEeContribution + totalErContribution;

    return {
      content: lines.join('\r\n'),
      memberCount: records.length,
      totalWages,
      totalEeContribution,
      totalErContribution,
      grandTotal,
    };
  }
}

