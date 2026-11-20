/**
 * Statutory and CTC calculation engine according to Indian payroll standards:
 * - Basic Salary: 40% - 50% of monthly CTC
 * - HRA: 50% of Basic for Metro, 40% for Non-Metro
 * - Standard Conveyance Allowance: ₹1,600 / mo
 * - Medical Allowance: ₹1,250 / mo
 * - EPF (Employee & Employer): 12% of basic up to statutory wage ceiling ₹15,000 (i.e. ₹1,800/mo)
 * - Professional Tax: ₹200 / mo (standard across major Indian states)
 * - Special Allowance: balancing figure to reconcile Gross = CTC - Employer PF
 * - TDS (Income Tax): New Tax Regime slab estimates with standard deduction ₹75,000
 */

export interface CtcCalculationInput {
  annualCTC: number;
  isMetro?: boolean;
  optOutPF?: boolean;
}

export interface CtcBreakdown {
  annualCTC: number;
  monthlyCTC: number;
  earnings: {
    basicSalary: number;
    hra: number;
    conveyanceAllowance: number;
    medicalAllowance: number;
    specialAllowance: number;
    otherAllowances: number;
    grossSalary: number;
  };
  deductions: {
    employeePf: number;
    employerPf: number;
    professionalTax: number;
    estimatedTds: number;
    totalDeductions: number;
  };
  netTakeHome: number;
}

export function calculateCtcBreakdown(
  input: CtcCalculationInput,
): CtcBreakdown {
  const annualCTC = Math.max(0, input.annualCTC);
  const monthlyCTC = Math.round(annualCTC / 12);

  // 1. Basic Salary (40% of CTC)
  const basicSalary = Math.round(monthlyCTC * 0.4);

  // 2. HRA (50% of Basic if Metro, 40% otherwise)
  const hraRate = input.isMetro ? 0.5 : 0.4;
  const hra = Math.round(basicSalary * hraRate);

  // 3. Fixed Allowances
  const conveyanceAllowance = 1600;
  const medicalAllowance = 1250;

  // 4. Statutory PF (12% of Basic, capped at statutory wage ceiling ₹15,000/mo = ₹1,800/mo)
  let employeePf = 0;
  let employerPf = 0;
  if (!input.optOutPF) {
    const pfWage = Math.min(basicSalary, 15000);
    employeePf = Math.round(pfWage * 0.12);
    employerPf = employeePf;
  }

  // 5. Professional Tax (Standard ₹200/month for earnings > ₹15,000)
  const professionalTax = monthlyCTC >= 15000 ? 200 : 0;

  // 6. Special Allowance = Monthly CTC - (Basic + HRA + Conveyance + Medical + Employer PF)
  const subtotalEarnings =
    basicSalary + hra + conveyanceAllowance + medicalAllowance;
  let specialAllowance = monthlyCTC - employerPf - subtotalEarnings;

  const otherAllowances = 0;
  if (specialAllowance < 0) {
    // If CTC is small, keep specialAllowance at 0 and adjust
    specialAllowance = 0;
  }

  const grossSalary =
    basicSalary +
    hra +
    conveyanceAllowance +
    medicalAllowance +
    specialAllowance +
    otherAllowances;

  // 7. Income Tax (TDS) under New Tax Regime (FY 2024-25 / 2025-26 rules)
  // Standard deduction of ₹75,000
  const taxableAnnual = Math.max(0, annualCTC - 75000);
  let annualTax = 0;

  if (taxableAnnual > 1500000) {
    annualTax += (taxableAnnual - 1500000) * 0.3;
    annualTax += 300000 * 0.2;
    annualTax += 300000 * 0.15;
    annualTax += 300000 * 0.1;
    annualTax += 300000 * 0.05;
  } else if (taxableAnnual > 1200000) {
    annualTax += (taxableAnnual - 1200000) * 0.2;
    annualTax += 300000 * 0.15;
    annualTax += 300000 * 0.1;
    annualTax += 300000 * 0.05;
  } else if (taxableAnnual > 900000) {
    annualTax += (taxableAnnual - 900000) * 0.15;
    annualTax += 300000 * 0.1;
    annualTax += 300000 * 0.05;
  } else if (taxableAnnual > 600000) {
    annualTax += (taxableAnnual - 600000) * 0.1;
    annualTax += 300000 * 0.05;
  } else if (taxableAnnual > 300000) {
    annualTax += (taxableAnnual - 300000) * 0.05;
  }

  // Section 87A rebate: zero tax if taxable income <= ₹7,000,000 under new regime
  if (annualCTC <= 775000) {
    annualTax = 0;
  } else {
    // Health and Education Cess @ 4%
    annualTax = Math.round(annualTax * 1.04);
  }

  const estimatedTds = Math.round(annualTax / 12);
  const totalDeductions = employeePf + professionalTax + estimatedTds;
  const netTakeHome = Math.max(0, grossSalary - totalDeductions);

  return {
    annualCTC,
    monthlyCTC,
    earnings: {
      basicSalary,
      hra,
      conveyanceAllowance,
      medicalAllowance,
      specialAllowance,
      otherAllowances,
      grossSalary,
    },
    deductions: {
      employeePf,
      employerPf,
      professionalTax,
      estimatedTds,
      totalDeductions,
    },
    netTakeHome,
  };
}
