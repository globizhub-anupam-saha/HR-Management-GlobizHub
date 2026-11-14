import { Injectable } from '@nestjs/common';
import { EsicMemberRecord } from './esic-provider.interface';

export interface EsicCalculationInput {
  ipNumber: string;
  ipName: string;
  grossSalary: number;
  totalWorkingDays: number;
  presentDays: number;
  unpaidLeaves: number;
  rates: Record<string, number>;
  hasDisability?: boolean; // Wage ceiling is 25,000 for employees with disability
}

@Injectable()
export class EsicCalculatorService {
  /**
   * Calculates monthly ESIC contributions.
   */
  calculateMember(input: EsicCalculationInput): EsicMemberRecord | null {
    // ESIC statutory wage ceiling: ₹21,000 (₹25,000 for employees with disability)
    const wageCeiling = input.hasDisability ? 25000 : 21000;
    if (input.grossSalary > wageCeiling) {
      return null;
    }

    const eeRate = input.rates['ESI_EE'] ?? 0.0075;
    const erRate = input.rates['ESI_ER'] ?? 0.0325;

    const noOfDaysWagesPaid = Math.max(0, input.presentDays);
    const monthlyWages = Math.round(input.grossSalary);

    // Rule: Exemption from employee share for daily wage up to Rs. 176
    const dailyWage = noOfDaysWagesPaid > 0 ? monthlyWages / noOfDaysWagesPaid : 0;
    const isExemptDailyWage = dailyWage > 0 && dailyWage <= 176;

    // 1. Employee contribution: 0.75%
    const eeContribution = isExemptDailyWage ? 0 : Math.ceil(monthlyWages * eeRate);

    // 2. Employer contribution: 3.25% (ESIC rounds to nearest whole rupee)
    const erContribution = Math.ceil(monthlyWages * erRate);

    const totalContribution = eeContribution + erContribution;

    return {
      ipNumber: input.ipNumber,
      ipName: input.ipName,
      noOfDaysWagesPaid,
      totalMonthlyWages: monthlyWages,
      reasonForZeroWages: noOfDaysWagesPaid === 0 ? 1 : 0, // 0 = normal worked, 1 = on leave
      eeContribution,
      erContribution,
      totalContribution,
    };
  }
}

