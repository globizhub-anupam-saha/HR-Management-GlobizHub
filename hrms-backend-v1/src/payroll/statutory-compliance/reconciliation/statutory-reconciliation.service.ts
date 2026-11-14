import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StatutoryCalculatorService } from '../common/statutory-calculator.service';

export interface ReconciliationReport {
  returnId: string;
  type: string;
  month: Date;
  status: 'MATCHED' | 'MISMATCH';
  totalContributions: number;
  totalChallanAmount: number;
  totalPaidAmount: number;
  discrepancyAmount: number;
  details: {
    contributionsCount: number;
    challansCount: number;
    paymentsCount: number;
    breakdownByCategory: Record<string, { employee: number; employer: number; total: number }>;
  };
  notes?: string;
}

@Injectable()
export class StatutoryReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculatorService: StatutoryCalculatorService,
  ) {}

  /**
   * Reconciles a Statutory Return against computed contributions, challans, and payments.
   */
  async reconcileReturn(companyId: string, returnId: string, customNotes?: string) {
    const statutoryReturn = await this.prisma.statutoryReturn.findFirst({
      where: { id: returnId, companyId },
      include: {
        establishment: true,
        challans: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!statutoryReturn) {
      throw new NotFoundException('Statutory return not found');
    }

    // 1. Fetch all statutory contributions matching this establishment, category type, and month
    // Determine category filter based on return type (PF or ESI)
    const categoryFilter =
      statutoryReturn.type === 'PF'
        ? ['PF', 'EPS', 'EDLI', 'Administrative', 'EPF_EE', 'EPF_ER_PENSION', 'EPF_ER_DIFF']
        : ['ESI', 'ESIC'];

    let contributions = await this.prisma.statutoryContribution.findMany({
      where: {
        companyId,
        month: statutoryReturn.month,
        category: { in: categoryFilter },
      },
    });

    // If no contributions snapshotted yet, trigger auto-calculation for that return's period
    if (contributions.length === 0) {
      try {
        const calMonth = statutoryReturn.month.getUTCMonth() + 1;
        const calYear = statutoryReturn.month.getUTCFullYear();
        await this.calculatorService.calculateAndSnapshot(companyId, {
          establishmentId: statutoryReturn.establishmentId,
          month: calMonth,
          year: calYear,
          type: statutoryReturn.type as 'PF' | 'ESI',
        });

        contributions = await this.prisma.statutoryContribution.findMany({
          where: {
            companyId,
            month: statutoryReturn.month,
            category: { in: categoryFilter },
          },
        });
      } catch (calcErr) {
        console.warn('Auto-calculation during reconciliation error:', calcErr);
      }
    }

    // 2. Aggregate Contributions
    let totalContributionAmt = 0;
    const breakdownByCategory: Record<string, { employee: number; employer: number; total: number }> = {};

    for (const c of contributions) {
      const emp = Number(c.employeeAmount) || 0;
      const empyr = Number(c.employerAmount) || 0;
      const sum = emp + empyr;
      totalContributionAmt += sum;

      if (!breakdownByCategory[c.category]) {
        breakdownByCategory[c.category] = { employee: 0, employer: 0, total: 0 };
      }
      breakdownByCategory[c.category].employee += emp;
      breakdownByCategory[c.category].employer += empyr;
      breakdownByCategory[c.category].total += sum;
    }

    // Fallback: If still 0, aggregate directly from payroll records of that month
    if (totalContributionAmt === 0) {
      const calMonth = statutoryReturn.month.getUTCMonth() + 1;
      const calYear = statutoryReturn.month.getUTCFullYear();
      const records = await this.prisma.payrollRecord.findMany({
        where: { companyId, month: calMonth, year: calYear },
      });
      for (const r of records) {
        const breakdown = r.breakdown as any;
        if (statutoryReturn.type === 'PF') {
          // Employee PF + Employer PF matching challan
          const pf = ((breakdown?.deductions?.pf as number) || 0) * 2;
          totalContributionAmt += pf;
        } else {
          const gross = r.basicPay + r.allowances;
          totalContributionAmt += Math.round(gross * 0.04);
        }
      }
    }

    // 3. Aggregate Challans & Payments
    let totalChallanAmt = 0;
    let totalPaidAmt = 0;
    let paymentsCount = 0;

    for (const ch of statutoryReturn.challans) {
      totalChallanAmt += Number(ch.amount) || 0;
      for (const p of ch.payments) {
        if (p.status === 'RECORDED' || p.status === 'VERIFIED') {
          totalPaidAmt += Number(p.amount) || 0;
          paymentsCount++;
        }
      }
    }

    // 4. Compute Discrepancy
    // Compare total computed contributions vs challans or payments
    const diffWithChallan = Math.abs(Math.round(totalContributionAmt) - Math.round(totalChallanAmt));
    const diffWithPaid = Math.abs(Math.round(totalContributionAmt) - Math.round(totalPaidAmt));

    // A return is MATCHED if there is at least one challan and the contribution matches the challan within +/- 1 INR tolerance (due to roundings)
    const isMatched = statutoryReturn.challans.length > 0 && diffWithChallan <= 1;
    const status = isMatched ? 'MATCHED' : 'MISMATCH';

    const discrepancies = {
      totalContributions: Math.round(totalContributionAmt * 100) / 100,
      totalChallanAmount: Math.round(totalChallanAmt * 100) / 100,
      totalPaidAmount: Math.round(totalPaidAmt * 100) / 100,
      diffWithChallan,
      diffWithPaid,
      breakdownByCategory,
      contributionsCount: contributions.length,
      challansCount: statutoryReturn.challans.length,
      paymentsCount,
    };

    let notes = customNotes;
    if (!notes) {
      if (statutoryReturn.challans.length === 0) {
        notes = 'No challan generated yet for this statutory return.';
      } else if (diffWithChallan > 1) {
        notes = `Discrepancy of ₹${diffWithChallan} detected between calculated payroll contributions and generated challan amount.`;
      } else if (diffWithPaid > 1) {
        notes = `Challan generated matches contributions, but pending full payment (Paid: ₹${totalPaidAmt}, Due: ₹${totalChallanAmt}).`;
      } else {
        notes = 'Perfect match: computed payroll contributions, generated challan, and recorded payments align.';
      }
    }

    // 5. Store StatutoryReconciliation in DB
    const record = await this.prisma.statutoryReconciliation.create({
      data: {
        returnId,
        status,
        notes,
        discrepancies,
      },
      include: {
        return: {
          include: {
            establishment: true,
          },
        },
      },
    });

    return record;
  }

  /**
   * Retrieves reconciliation history for a specific statutory return or all returns in an establishment.
   */
  async getReconciliations(companyId: string, returnId?: string, establishmentId?: string) {
    const where: any = {
      return: {
        companyId,
      },
    };

    if (returnId) {
      where.returnId = returnId;
    }

    if (establishmentId) {
      where.return = {
        ...where.return,
        establishmentId,
      };
    }

    return this.prisma.statutoryReconciliation.findMany({
      where,
      include: {
        return: {
          include: {
            establishment: true,
            challans: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

