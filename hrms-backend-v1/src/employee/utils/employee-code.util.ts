import { PrismaClient } from '../../../generated/prisma/client';

export interface GenerateEmployeeCodeOptions {
  companyId: string;
  departmentId?: string | null;
  excludeEmployeeId?: string;
  prisma: any;
}

/**
 * Generates an Employee ID formatted according to Company Settings,
 * with department-scoped sequential numbering (each department starts at 001/0001, etc.)
 * and collision prevention.
 */
export async function generateDepartmentScopedEmployeeCode(
  options: GenerateEmployeeCodeOptions,
): Promise<string> {
  const { prisma, companyId, departmentId, excludeEmployeeId } = options;

  // 1. Fetch Company Settings and Company info
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      name: true,
      settings: {
        select: {
          employeeIdPrefix: true,
          employeeIdFormat: true,
          employeeIdDigits: true,
        },
      },
    },
  });

  const settings = company?.settings;

  // 2. Company Prefix (e.g., "ACM", "EMP")
  const compPrefix =
    settings?.employeeIdPrefix ||
    company?.name
      ?.replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase() ||
    'EMP';

  // 3. Department Prefix (e.g., "ENG", "HR", "MED")
  let deptPrefix = 'GEN';
  if (departmentId) {
    const dept = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { name: true },
    });
    if (dept?.name) {
      const cleanName = dept.name.trim();
      const words = cleanName.split(/\s+/).filter(Boolean);
      // For multi-word departments like "Human Resources", "Information Technology", use acronym
      if (words.length > 1 && words.length <= 4) {
        const acronym = words
          .map((w: string) => w[0].replace(/[^a-zA-Z0-9]/g, ''))
          .join('');
        if (acronym.length >= 2) {
          deptPrefix = acronym.toUpperCase();
        } else {
          deptPrefix =
            cleanName
              .replace(/[^a-zA-Z0-9]/g, '')
              .substring(0, 3)
              .toUpperCase() || 'GEN';
        }
      } else {
        deptPrefix =
          cleanName
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 3)
            .toUpperCase() || 'GEN';
      }
    }
  }

  // 4. Formatting rules
  const digits = settings?.employeeIdDigits || 3;
  const format = settings?.employeeIdFormat || '{PREFIX}-{DEPT}-{NUMBER}';
  const currentYear = new Date().getFullYear().toString();
  const shortYear = currentYear.slice(-2);

  // 5. DEPARTMENT-SCOPED SEQUENCE COUNTER:
  // Find highest sequence number among employees assigned to this specific department
  const deptWhere: any = {
    companyId,
    employeeCode: { not: null },
  };

  if (departmentId) {
    deptWhere.departmentId = departmentId;
  } else {
    deptWhere.departmentId = null;
  }

  if (excludeEmployeeId) {
    deptWhere.id = { not: excludeEmployeeId };
  }

  const deptEmployees = await prisma.employee.findMany({
    where: deptWhere,
    select: { employeeCode: true },
  });

  let maxNum = 0;
  for (const e of deptEmployees) {
    if (e.employeeCode) {
      const match = e.employeeCode.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      } else {
        const parts = e.employeeCode.split(/[-_./]/);
        for (const part of parts) {
          const num = parseInt(part, 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
  }

  // 6. Generate candidate code and ensure company-wide uniqueness
  let nextSeq = maxNum + 1;
  let finalCode = '';

  while (true) {
    const sequentialNumber = String(nextSeq).padStart(digits, '0');

    let code = format
      .replace(/\{PREFIX\}|\[PREFIX\]/gi, compPrefix)
      .replace(/\{DEPT\}|\[DEPT\]/gi, deptPrefix)
      .replace(/\{YEAR\}|\[YEAR\]/gi, currentYear)
      .replace(/\{YY\}|\[YY\]/gi, shortYear);

    if (/\{NUMBER\}|\[NUMBER\]/gi.test(code)) {
      code = code.replace(/\{NUMBER\}|\[NUMBER\]/gi, sequentialNumber);
    } else {
      code = `${code}-${sequentialNumber}`;
    }

    // Verify code is not already assigned to any other employee in this company
    const existing = await prisma.employee.findFirst({
      where: {
        companyId,
        employeeCode: code,
        ...(excludeEmployeeId ? { id: { not: excludeEmployeeId } } : {}),
      },
    });

    if (!existing) {
      finalCode = code;
      break;
    }

    nextSeq++;
  }

  return finalCode;
}
