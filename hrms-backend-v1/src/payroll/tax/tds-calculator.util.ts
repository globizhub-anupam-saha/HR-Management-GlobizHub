/**
 * Indian Income Tax (TDS on Salary - Section 192) computation engine.
 * Computes taxable income, deductions, exemptions, and monthly TDS under
 * both the Old Tax Regime and the New Tax Regime (FY 2024-25 / FY 2025-26).
 */

export interface TdsCalculationInput {
  annualGrossSalary: number;
  annualBasicSalary: number;
  annualHraReceived: number;
  regime: 'OLD' | 'NEW';
  isMetro?: boolean;

  // Declarations / Proofs (primarily effective under OLD regime)
  annualRentPaid?: number;
  section80C?: number; // Capped at 150,000
  section80D?: number; // Health Insurance (Self/Parents)
  section24b?: number; // Home Loan Interest (Capped at 200,000)
  section80E?: number; // Higher education loan interest
  section80G?: number; // Donations
  section80CCD1B?: number; // Additional NPS (Capped at 50,000)
  otherDeductions?: number;

  tdsAlreadyPaid?: number;
  remainingMonthsInFY?: number; // default 12 or remaining pay periods
}

export interface TdsCalculationResult {
  regime: 'OLD' | 'NEW';
  grossSalary: number;
  standardDeduction: number;
  exemptions: {
    hraExemption: number;
    totalExemptions: number;
  };
  deductions: {
    section80C: number;
    section80D: number;
    section24b: number;
    section80CCD1B: number;
    section80E: number;
    section80G: number;
    otherDeductions: number;
    totalDeductions: number;
  };
  taxableIncome: number;
  incomeTaxBeforeRebate: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalAnnualTax: number;
  monthlyTds: number;
}

export function calculateTds(input: TdsCalculationInput): TdsCalculationResult {
  const regime = input.regime || 'NEW';
  const gross = Math.max(0, input.annualGrossSalary);
  const basic = Math.max(0, input.annualBasicSalary);
  const hraReceived = Math.max(0, input.annualHraReceived);
  const rentPaid = Math.max(0, input.annualRentPaid || 0);

  let standardDeduction = 0;
  let hraExemption = 0;
  let allowed80C = 0;
  let allowed80D = 0;
  let allowed24b = 0;
  let allowed80CCD1B = 0;
  let allowed80E = 0;
  let allowed80G = 0;
  let allowedOthers = 0;

  if (regime === 'OLD') {
    // 1. Standard Deduction under Old Regime: ₹50,000
    standardDeduction = Math.min(50000, gross);

    // 2. HRA Exemption under Section 10(13A): Least of 3 limits
    if (rentPaid > 0 && hraReceived > 0) {
      const excessRent = Math.max(0, rentPaid - 0.10 * basic);
      const metroCap = (input.isMetro ? 0.50 : 0.40) * basic;
      hraExemption = Math.min(hraReceived, excessRent, metroCap);
    }

    // 3. Chapter VI-A Deductions
    allowed80C = Math.min(150000, Math.max(0, input.section80C || 0));
    allowed80D = Math.min(100000, Math.max(0, input.section80D || 0));
    allowed24b = Math.min(200000, Math.max(0, input.section24b || 0));
    allowed80CCD1B = Math.min(50000, Math.max(0, input.section80CCD1B || 0));
    allowed80E = Math.max(0, input.section80E || 0);
    allowed80G = Math.max(0, input.section80G || 0);
    allowedOthers = Math.max(0, input.otherDeductions || 0);
  } else {
    // NEW REGIME (Default):
    // Standard Deduction under New Regime: ₹75,000 (Finance Act 2024)
    standardDeduction = Math.min(75000, gross);
    // Exemptions and Chapter VI-A deductions are NOT allowed under New Regime
    hraExemption = 0;
    allowed80C = 0;
    allowed80D = 0;
    allowed24b = 0;
    allowed80CCD1B = 0;
    allowed80E = 0;
    allowed80G = 0;
    allowedOthers = 0;
  }

  const totalExemptions = hraExemption;
  const totalDeductions =
    allowed80C +
    allowed80D +
    allowed24b +
    allowed80CCD1B +
    allowed80E +
    allowed80G +
    allowedOthers;

  const totalRelief = standardDeduction + totalExemptions + totalDeductions;
  const taxableIncome = Math.max(0, Math.round(gross - totalRelief));

  let tax = 0;

  if (regime === 'OLD') {
    // Old Regime Tax Slabs:
    // Up to 2.5L: Nil
    // 2.5L - 5L: 5%
    // 5L - 10L: 20%
    // Above 10L: 30%
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.30;
      tax += 500000 * 0.20;
      tax += 250000 * 0.05;
    } else if (taxableIncome > 500000) {
      tax += (taxableIncome - 500000) * 0.20;
      tax += 250000 * 0.05;
    } else if (taxableIncome > 250000) {
      tax += (taxableIncome - 250000) * 0.05;
    }

    // Section 87A rebate: 100% tax rebate if taxable income <= 5,00,000
    let rebate87A = 0;
    if (taxableIncome <= 500000) {
      rebate87A = tax;
    }

    const taxAfterRebate = Math.max(0, tax - rebate87A);
    const cess = Math.round(taxAfterRebate * 0.04);
    const totalAnnualTax = taxAfterRebate + cess;

    const remainingMonths = input.remainingMonthsInFY && input.remainingMonthsInFY > 0
      ? input.remainingMonthsInFY
      : 12;
    const remainingTax = Math.max(0, totalAnnualTax - (input.tdsAlreadyPaid || 0));
    const monthlyTds = Math.round(remainingTax / remainingMonths);

    return {
      regime,
      grossSalary: gross,
      standardDeduction,
      exemptions: {
        hraExemption,
        totalExemptions,
      },
      deductions: {
        section80C: allowed80C,
        section80D: allowed80D,
        section24b: allowed24b,
        section80CCD1B: allowed80CCD1B,
        section80E: allowed80E,
        section80G: allowed80G,
        otherDeductions: allowedOthers,
        totalDeductions,
      },
      taxableIncome,
      incomeTaxBeforeRebate: Math.round(tax),
      rebate87A: Math.round(rebate87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      cess,
      totalAnnualTax,
      monthlyTds,
    };
  } else {
    // NEW REGIME SLABS (FY 2024-25 & FY 2025-26):
    // 0 - 3,00,000: NIL
    // 3,00,001 - 7,00,000: 5%
    // 7,00,001 - 10,00,000: 10%
    // 10,00,001 - 12,00,000: 15%
    // 12,00,001 - 15,00,000: 20%
    // Above 15,00,000: 30%
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
      tax += 300000 * 0.20;
      tax += 200000 * 0.15;
      tax += 300000 * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.20;
      tax += 200000 * 0.15;
      tax += 300000 * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.15;
      tax += 300000 * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 700000) {
      tax += (taxableIncome - 700000) * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }

    // Section 87A rebate under New Regime: zero tax if taxable income <= 7,00,000
    let rebate87A = 0;
    if (taxableIncome <= 700000) {
      rebate87A = tax;
    }

    const taxAfterRebate = Math.max(0, tax - rebate87A);
    const cess = Math.round(taxAfterRebate * 0.04);
    const totalAnnualTax = taxAfterRebate + cess;

    const remainingMonths = input.remainingMonthsInFY && input.remainingMonthsInFY > 0
      ? input.remainingMonthsInFY
      : 12;
    const remainingTax = Math.max(0, totalAnnualTax - (input.tdsAlreadyPaid || 0));
    const monthlyTds = Math.round(remainingTax / remainingMonths);

    return {
      regime,
      grossSalary: gross,
      standardDeduction,
      exemptions: {
        hraExemption: 0,
        totalExemptions: 0,
      },
      deductions: {
        section80C: 0,
        section80D: 0,
        section24b: 0,
        section80CCD1B: 0,
        section80E: 0,
        section80G: 0,
        otherDeductions: 0,
        totalDeductions: 0,
      },
      taxableIncome,
      incomeTaxBeforeRebate: Math.round(tax),
      rebate87A: Math.round(rebate87A),
      taxAfterRebate: Math.round(taxAfterRebate),
      cess,
      totalAnnualTax,
      monthlyTds,
    };
  }
}

