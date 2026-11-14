/**
 * State-specific Professional Tax (PT) and Labour Welfare Fund (LWF) calculation engine
 * according to state statutory laws in India.
 */

export interface StatePtInput {
  state: string;
  grossSalary: number;
  month: number; // 1 to 12
  gender?: 'MALE' | 'FEMALE';
}

export interface StateLwfInput {
  state: string;
  grossSalary: number;
  month: number; // 1 to 12
}

export interface StateLwfResult {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  isDeductionMonth: boolean;
}

/**
 * Calculates Professional Tax based on state and monthly gross earnings
 */
export function calculateStateProfessionalTax(input: StatePtInput): number {
  const state = (input.state || '').toUpperCase().trim();
  const gross = Math.max(0, input.grossSalary || 0);
  const month = input.month; // 1 = Jan, 2 = Feb, etc.

  switch (state) {
    case 'MAHARASHTRA':
    case 'MH': {
      // Maharashtra: < 7,500: 0 | 7,501 - 10,000: 175 | > 10,000: 200 (Feb is 300)
      if (gross <= 7500) return 0;
      if (gross <= 10000) return 175;
      return month === 2 ? 300 : 200;
    }

    case 'KARNATAKA':
    case 'KA': {
      // Karnataka: <= 15,000: 0 | > 15,000: 200
      return gross > 15000 ? 200 : 0;
    }

    case 'TELANGANA':
    case 'TG':
    case 'TS':
    case 'ANDHRA PRADESH':
    case 'AP': {
      // AP / Telangana: <= 15,000: 0 | 15,001 - 20,000: 150 | > 20,000: 200
      if (gross <= 15000) return 0;
      if (gross <= 20000) return 150;
      return 200;
    }

    case 'WEST BENGAL':
    case 'WB': {
      // West Bengal: <= 10,000: 0 | 10,001 - 15,000: 110 | 15,001 - 25,000: 130 | 25,001 - 40,000: 150 | > 40,000: 200
      if (gross <= 10000) return 0;
      if (gross <= 15000) return 110;
      if (gross <= 25000) return 130;
      if (gross <= 40000) return 150;
      return 200;
    }

    case 'GUJARAT':
    case 'GJ': {
      // Gujarat: <= 12,000: 0 | > 12,000: 200
      return gross > 12000 ? 200 : 0;
    }

    case 'TAMIL NADU':
    case 'TN': {
      // Tamil Nadu: Semi-annual slabs. Monthly equivalent averaged:
      if (gross <= 21000) return 0;
      if (gross <= 30000) return 100;
      if (gross <= 45000) return 150;
      if (gross <= 60000) return 180;
      return 208;
    }

    case 'MADHYA PRADESH':
    case 'MP': {
      // Madhya Pradesh: <= 18,750: 0 | 18,751 - 25,000: 125 | 25,001 - 33,333: 167 | > 33,333: 208
      if (gross <= 18750) return 0;
      if (gross <= 25000) return 125;
      if (gross <= 33333) return 167;
      return 208;
    }

    case 'DELHI':
    case 'DL':
    case 'HARYANA':
    case 'HR':
    case 'RAJASTHAN':
    case 'RJ':
    case 'UTTAR PRADESH':
    case 'UP':
      // No Professional Tax enacted in these states/UTs
      return 0;

    default:
      // Standard default for registered employees with salary > 15,000
      return gross >= 15000 ? 200 : 0;
  }
}

/**
 * Calculates Labour Welfare Fund (LWF) contributions
 */
export function calculateStateLwf(input: StateLwfInput): StateLwfResult {
  const state = (input.state || '').toUpperCase().trim();
  const month = input.month; // 1 to 12

  switch (state) {
    case 'MAHARASHTRA':
    case 'MH': {
      // Deducted in June (month 6) and December (month 12)
      if (month === 6) {
        return {
          employeeContribution: 12,
          employerContribution: 36,
          totalContribution: 48,
          isDeductionMonth: true,
        };
      }
      if (month === 12) {
        return {
          employeeContribution: 24,
          employerContribution: 72,
          totalContribution: 96,
          isDeductionMonth: true,
        };
      }
      return { employeeContribution: 0, employerContribution: 0, totalContribution: 0, isDeductionMonth: false };
    }

    case 'KARNATAKA':
    case 'KA': {
      // Deducted annually in December (month 12)
      if (month === 12) {
        return {
          employeeContribution: 20,
          employerContribution: 40,
          totalContribution: 60,
          isDeductionMonth: true,
        };
      }
      return { employeeContribution: 0, employerContribution: 0, totalContribution: 0, isDeductionMonth: false };
    }

    case 'GUJARAT':
    case 'GJ': {
      // Deducted semi-annually in June and December
      if (month === 6 || month === 12) {
        return {
          employeeContribution: 6,
          employerContribution: 12,
          totalContribution: 18,
          isDeductionMonth: true,
        };
      }
      return { employeeContribution: 0, employerContribution: 0, totalContribution: 0, isDeductionMonth: false };
    }

    default:
      return {
        employeeContribution: 0,
        employerContribution: 0,
        totalContribution: 0,
        isDeductionMonth: false,
      };
  }
}

