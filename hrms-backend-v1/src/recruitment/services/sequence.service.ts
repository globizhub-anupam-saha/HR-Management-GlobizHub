import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SequenceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates a transaction-safe, tenant-isolated sequential identifier.
   * Format: {PREFIX}-{YEAR}-{0000} (e.g. MR-2026-0001, JOB-2026-0001)
   * Uses PostgreSQL atomic upsert to guarantee zero race condition collisions.
   */
  async getNextSequence(
    companyId: string,
    entityType:
      'MANPOWER_REQUISITION' | 'JOB_REQUISITION' | 'JOB_OFFER' | 'EMPLOYEE',
    prefix: string,
  ): Promise<string> {
    const year = new Date().getFullYear();

    const result = await this.prisma.$queryRaw<Array<{ currentValue: number }>>`
      INSERT INTO "CompanySequence" ("id", "companyId", "entityType", "year", "currentValue", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${companyId}, ${entityType}, ${year}, 1, NOW(), NOW())
      ON CONFLICT ("companyId", "entityType", "year")
      DO UPDATE SET "currentValue" = "CompanySequence"."currentValue" + 1, "updatedAt" = NOW()
      RETURNING "currentValue";
    `;

    const seqNum = result[0]?.currentValue || 1;
    const padded = String(seqNum).padStart(4, '0');
    return `${prefix}-${year}-${padded}`;
  }

  /**
   * Generates employee code following the Company Settings configuration (format, prefix, digits).
   * Matches the exact algorithm used across the HRMS (including OnboardingService) to ensure uniform ID formatting.
   */
  async generateEmployeeCode(
    companyId: string,
    departmentId?: string | null,
    prismaClient?: any,
  ): Promise<string> {
    const client = prismaClient || this.prisma;

    const company = await client.company.findUnique({
      where: { id: companyId },
      include: {
        settings: true,
      },
    });

    const settings = company?.settings;

    const compPrefix =
      settings?.employeeIdPrefix ||
      company?.name
        ?.replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 3)
        .toUpperCase() ||
      'EMP';

    let deptPrefix = 'GEN';
    if (departmentId) {
      const dept = await client.department.findUnique({
        where: { id: departmentId },
        select: { name: true },
      });
      if (dept?.name) {
        deptPrefix =
          dept.name
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 3)
            .toUpperCase() || 'GEN';
      }
    }

    const existingEmployees = await client.employee.findMany({
      where: {
        companyId,
        employeeCode: { not: null },
      },
      select: { employeeCode: true },
    });

    let maxNum = 0;
    for (const e of existingEmployees) {
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

    const nextVal = maxNum + 1;
    const digits = settings?.employeeIdDigits || 3;
    const sequentialNumber = String(nextVal).padStart(digits, '0');
    const format = settings?.employeeIdFormat || '{PREFIX}-{DEPT}-{NUMBER}';
    const currentYear = new Date().getFullYear().toString();
    const shortYear = currentYear.slice(-2);

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

    return code;
  }
}
