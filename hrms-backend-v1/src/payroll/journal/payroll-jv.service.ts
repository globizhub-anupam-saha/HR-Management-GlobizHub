import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface JvLineItem {
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalVoucherReport {
  voucherNumber: string;
  voucherDate: string;
  companyName: string;
  month: number;
  year: number;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  entries: JvLineItem[];
  csvContent: string;
}

@Injectable()
export class PayrollJvService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a balanced Double-Entry Accounting Journal Voucher (JV)
   * for the monthly payroll run. Compatible with Tally, Zoho Books, and ERPs.
   */
  async generatePayrollJv(
    companyId: string,
    month: number,
    year: number,
  ): Promise<JournalVoucherReport> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    const records = await this.prisma.payrollRecord.findMany({
      where: { companyId, month, year },
      include: {
        statutoryContributions: true,
      },
    });

    if (records.length === 0) {
      throw new NotFoundException(
        `No payroll records found for ${month}/${year}. Please run payroll first.`,
      );
    }

    let totalGrossSalary = 0;
    let totalNetSalary = 0;
    let totalEmployeePf = 0;
    let totalEmployerPf = 0;
    let totalEmployeeEsi = 0;
    let totalEmployerEsi = 0;
    let totalProfTax = 0;
    let totalTds = 0;
    let totalLoanDeductions = 0;

    for (const r of records) {
      const breakdown = r.breakdown as any;
      const earnings = r.basicPay + r.allowances;
      totalGrossSalary += earnings;
      totalNetSalary += r.netSalary;
      totalProfTax += breakdown?.deductions?.profTax || 0;
      totalTds += r.tdsDeduction || breakdown?.deductions?.tax || 0;
      totalLoanDeductions += r.loanDeductions || 0;

      // Check statutory contributions snapshot if available
      const pfContr = r.statutoryContributions.filter((c) =>
        ['PF', 'EPF_EE', 'EPF_ER_PENSION', 'EPF_ER_DIFF', 'EPS', 'EDLI'].includes(c.category),
      );
      if (pfContr.length > 0) {
        for (const c of pfContr) {
          totalEmployeePf += Number(c.employeeAmount) || 0;
          totalEmployerPf += Number(c.employerAmount) || 0;
        }
      } else {
        totalEmployeePf += breakdown?.deductions?.pf || 0;
        totalEmployerPf += breakdown?.deductions?.pf || 0;
      }

      const esiContr = r.statutoryContributions.filter((c) =>
        ['ESI', 'ESIC'].includes(c.category),
      );
      if (esiContr.length > 0) {
        for (const c of esiContr) {
          totalEmployeeEsi += Number(c.employeeAmount) || 0;
          totalEmployerEsi += Number(c.employerAmount) || 0;
        }
      }
    }

    // Round amounts to 2 decimal places
    totalGrossSalary = parseFloat(totalGrossSalary.toFixed(2));
    totalNetSalary = parseFloat(totalNetSalary.toFixed(2));
    totalEmployeePf = parseFloat(totalEmployeePf.toFixed(2));
    totalEmployerPf = parseFloat(totalEmployerPf.toFixed(2));
    totalEmployeeEsi = parseFloat(totalEmployeeEsi.toFixed(2));
    totalEmployerEsi = parseFloat(totalEmployerEsi.toFixed(2));
    totalProfTax = parseFloat(totalProfTax.toFixed(2));
    totalTds = parseFloat(totalTds.toFixed(2));
    totalLoanDeductions = parseFloat(totalLoanDeductions.toFixed(2));

    const voucherDate = `${year}-${String(month).padStart(2, '0')}-28`;
    const narration = `Salary & Statutory JV for ${String(month).padStart(2, '0')}/${year}`;

    const entries: JvLineItem[] = [
      // 1. DEBIT: Gross Salaries & Wages Expense
      {
        accountCode: '5010',
        accountName: 'Salaries and Wages Expense',
        description: `Gross Salaries - ${narration}`,
        debit: totalGrossSalary,
        credit: 0,
      },
      // 2. DEBIT: Employer PF Contribution Expense
      ...(totalEmployerPf > 0
        ? [
            {
              accountCode: '5020',
              accountName: 'Employer EPF Contribution Expense',
              description: `Employer PF & Admin - ${narration}`,
              debit: totalEmployerPf,
              credit: 0,
            },
          ]
        : []),
      // 3. DEBIT: Employer ESIC Contribution Expense
      ...(totalEmployerEsi > 0
        ? [
            {
              accountCode: '5030',
              accountName: 'Employer ESIC Contribution Expense',
              description: `Employer ESIC - ${narration}`,
              debit: totalEmployerEsi,
              credit: 0,
            },
          ]
        : []),

      // 4. CREDIT: Net Salaries Payable / Bank Clearing
      {
        accountCode: '2010',
        accountName: 'Net Salaries Payable',
        description: `Net Take Home to Employees - ${narration}`,
        debit: 0,
        credit: totalNetSalary,
      },
      // 5. CREDIT: Employee PF Payable
      ...(totalEmployeePf > 0
        ? [
            {
              accountCode: '2021',
              accountName: 'EPF Payable (Employee Share)',
              description: `Employee PF Withholding - ${narration}`,
              debit: 0,
              credit: totalEmployeePf,
            },
          ]
        : []),
      // 6. CREDIT: Employer PF Payable
      ...(totalEmployerPf > 0
        ? [
            {
              accountCode: '2022',
              accountName: 'EPF Payable (Employer Share)',
              description: `Employer PF Remittance Due - ${narration}`,
              debit: 0,
              credit: totalEmployerPf,
            },
          ]
        : []),
      // 7. CREDIT: ESIC Payable (EE + ER)
      ...(totalEmployeeEsi + totalEmployerEsi > 0
        ? [
            {
              accountCode: '2030',
              accountName: 'ESIC Payable',
              description: `ESIC Total Remittance - ${narration}`,
              debit: 0,
              credit: parseFloat((totalEmployeeEsi + totalEmployerEsi).toFixed(2)),
            },
          ]
        : []),
      // 8. CREDIT: Professional Tax Payable
      ...(totalProfTax > 0
        ? [
            {
              accountCode: '2040',
              accountName: 'Professional Tax Payable',
              description: `PT Deductions Remittance - ${narration}`,
              debit: 0,
              credit: totalProfTax,
            },
          ]
        : []),
      // 9. CREDIT: TDS on Salary Payable (Section 192)
      ...(totalTds > 0
        ? [
            {
              accountCode: '2050',
              accountName: 'TDS Payable (u/s 192)',
              description: `Income Tax Deducted - ${narration}`,
              debit: 0,
              credit: totalTds,
            },
          ]
        : []),
      // 10. CREDIT: Loan & Advance Recoveries
      ...(totalLoanDeductions > 0
        ? [
            {
              accountCode: '1150',
              accountName: 'Employee Advance & Loan Clearing',
              description: `Salary Advance Recoveries - ${narration}`,
              debit: 0,
              credit: totalLoanDeductions,
            },
          ]
        : []),
    ];

    const totalDebit = parseFloat(entries.reduce((sum, e) => sum + e.debit, 0).toFixed(2));
    const totalCredit = parseFloat(entries.reduce((sum, e) => sum + e.credit, 0).toFixed(2));
    const isBalanced = Math.abs(totalDebit - totalCredit) < 1.0; // Rounding tolerance < 1 rupee

    // Generate CSV for Tally / Zoho Books import
    const headers = ['Voucher No', 'Date', 'Account Code', 'Account Name', 'Description', 'Debit', 'Credit'];
    const csvRows = entries.map((e) => [
      `JV-${year}-${String(month).padStart(2, '0')}`,
      voucherDate,
      `"${e.accountCode}"`,
      `"${e.accountName}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.debit.toFixed(2),
      e.credit.toFixed(2),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\r\n');

    return {
      voucherNumber: `JV-${year}-${String(month).padStart(2, '0')}`,
      voucherDate,
      companyName: company.name,
      month,
      year,
      totalDebit,
      totalCredit,
      isBalanced,
      entries,
      csvContent,
    };
  }
}

