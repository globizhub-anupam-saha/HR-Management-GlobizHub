import { Injectable } from '@nestjs/common';
import { EcrMemberRecord } from './epfo-provider.interface';

export interface EpfoCalculationInput {
  uan: string;
  memberName: string;
  grossSalary: number;
  basicSalary: number;
  unpaidLeaves: number;
  totalWorkingDays: number;
  rates: Record<string, number>;
  voluntaryHigherPf?: boolean;
  age?: number;
}

@Injectable()
export class EpfoCalculatorService {
  /**
   * Calculates EPFO contribution for an employee for a given month.
   */
  calculateMember(input: EpfoCalculationInput): EcrMemberRecord {
    const eeRate = input.rates['EPF'] ?? 0.12;
    const epsRate = input.rates['EPS'] ?? 0.0833;

    const wageCeiling = 15000;
    const epfWage = input.voluntaryHigherPf 
      ? input.basicSalary 
      : Math.min(input.basicSalary, wageCeiling);

    // If member is 58 years or older, no pension contribution (EPS wage = 0)
    const isPensionEligible = input.age === undefined || input.age < 58;
    const epsWage = isPensionEligible ? Math.min(input.basicSalary, wageCeiling) : 0;
    const edliWage = Math.min(input.basicSalary, wageCeiling);

    // 1. Employee share (12% of EPF wages)
    const eeEpfShare = Math.round(epfWage * eeRate);

    // 2. Employer EPS share (8.33% of EPS wages, capped at 1250)
    let erEpsShare = 0;
    if (isPensionEligible && epsWage > 0) {
      erEpsShare = Math.min(Math.round(epsWage * epsRate), 1250);
    }

    // 3. Employer EPF difference = (Total ER 12% contribution - EPS share)
    const totalErEpfExpected = Math.round(epfWage * eeRate);
    const erEpfDiff = Math.max(0, totalErEpfExpected - erEpsShare);

    return {
      uan: input.uan,
      memberName: input.memberName,
      grossWages: Math.round(input.grossSalary),
      epfWages: Math.round(epfWage),
      epsWages: Math.round(epsWage),
      edliWages: Math.round(edliWage),
      eeEpfShare,
      erEpsShare,
      erEpfDiff,
      ncpDays: Math.max(0, input.unpaidLeaves),
      refundOfAdvances: 0,
    };
  }
}

