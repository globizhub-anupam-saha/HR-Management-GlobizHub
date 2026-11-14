import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StatutoryRulesService } from './statutory-rules.service';
import { EpfoCalculatorService } from '../epfo/epfo-calculator.service';
import { EsicCalculatorService } from '../esic/esic-calculator.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CalculateStatutoryDto } from '../dto/statutory-operations.dto';

@Injectable()
export class StatutoryCalculatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rulesService: StatutoryRulesService,
    private readonly epfoCalculator: EpfoCalculatorService,
    private readonly esicCalculator: EsicCalculatorService,
  ) {}

  async calculateAndSnapshot(companyId: string, dto: CalculateStatutoryDto) {
    const establishment = await this.prisma.statutoryEstablishment.findFirst({
      where: { id: dto.establishmentId, companyId },
    });
    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    // 1. Fetch payroll records for this month and year
    const payrollRecords = await this.prisma.payrollRecord.findMany({
      where: {
        companyId,
        month: dto.month,
        year: dto.year,
      },
      include: {
        employee: {
          include: {
            statutoryProfiles: true,
          },
        },
      },
    });

    if (payrollRecords.length === 0) {
      throw new BadRequestException(
        `No processed payroll records found for ${dto.month}/${dto.year}. Please process payroll first.`,
      );
    }

    const monthDate = new Date(Date.UTC(dto.year, dto.month - 1, 1));
    const activeRates = await this.rulesService.getActiveRules(dto.establishmentId, monthDate);

    // Determine calculation version: find latest version and increment
    const latestContribution = await this.prisma.statutoryContribution.findFirst({
      where: {
        companyId,
        establishmentId: dto.establishmentId,
        month: monthDate,
      },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const nextVersion = (latestContribution?.version ?? 0) + 1;

    let epfoMemberCount = 0;
    let esicMemberCount = 0;
    let totalEpfoEmployee = 0;
    let totalEpfoEmployer = 0;
    let totalEsicEmployee = 0;
    let totalEsicEmployer = 0;

    const contributionsToCreate: any[] = [];

    for (const record of payrollRecords) {
      const profile =
        record.employee.statutoryProfiles?.find(
          (sp) => sp.establishmentId === dto.establishmentId,
        ) || record.employee.statutoryProfiles?.[0];
      const basicPay = record.basicPay;
      const grossSalary = record.basicPay + record.allowances;

      // --- EPFO Calculation ---
      if (dto.type === 'ALL' || dto.type === 'PF') {
        const uan = profile?.epfoUan || record.employee.uanNumber;
        if (uan) {
          const epfResult = this.epfoCalculator.calculateMember({
            uan,
            memberName: `${record.employee.firstName} ${record.employee.lastName}`,
            grossSalary,
            basicSalary: basicPay,
            unpaidLeaves: record.unpaidLeaves,
            totalWorkingDays: record.totalWorkingDays,
            rates: activeRates,
          });

          // Account 1 (Employee PF)
          contributionsToCreate.push({
            companyId,
            establishmentId: dto.establishmentId,
            payrollRunId: record.id,
            employeeId: record.employeeId,
            category: 'EPF_EE',
            employeeAmount: new Decimal(epfResult.eeEpfShare),
            employerAmount: new Decimal(0),
            month: monthDate,
            version: nextVersion,
          });

          // Account 1 & 10 (Employer EPS + EPF Diff)
          contributionsToCreate.push({
            companyId,
            establishmentId: dto.establishmentId,
            payrollRunId: record.id,
            employeeId: record.employeeId,
            category: 'EPF_ER_PENSION',
            employeeAmount: new Decimal(0),
            employerAmount: new Decimal(epfResult.erEpsShare),
            month: monthDate,
            version: nextVersion,
          });

          contributionsToCreate.push({
            companyId,
            establishmentId: dto.establishmentId,
            payrollRunId: record.id,
            employeeId: record.employeeId,
            category: 'EPF_ER_DIFF',
            employeeAmount: new Decimal(0),
            employerAmount: new Decimal(epfResult.erEpfDiff),
            month: monthDate,
            version: nextVersion,
          });

          epfoMemberCount++;
          totalEpfoEmployee += epfResult.eeEpfShare;
          totalEpfoEmployer += (epfResult.erEpsShare + epfResult.erEpfDiff);
        }
      }

      // --- ESIC Calculation ---
      if (dto.type === 'ALL' || dto.type === 'ESI') {
        const ipNumber = profile?.esicIpNumber;
        if (ipNumber) {
          const esicResult = this.esicCalculator.calculateMember({
            ipNumber,
            ipName: `${record.employee.firstName} ${record.employee.lastName}`,
            grossSalary,
            totalWorkingDays: record.totalWorkingDays,
            presentDays: record.presentDays,
            unpaidLeaves: record.unpaidLeaves,
            rates: activeRates,
          });

          if (esicResult) {
            contributionsToCreate.push({
              companyId,
              establishmentId: dto.establishmentId,
              payrollRunId: record.id,
              employeeId: record.employeeId,
              category: 'ESIC',
              employeeAmount: new Decimal(esicResult.eeContribution),
              employerAmount: new Decimal(esicResult.erContribution),
              month: monthDate,
              version: nextVersion,
            });

            esicMemberCount++;
            totalEsicEmployee += esicResult.eeContribution;
            totalEsicEmployer += esicResult.erContribution;
          }
        }
      }
    }

    // Persist all calculated contributions in a transaction
    await this.prisma.$transaction(
      contributionsToCreate.map((data) => this.prisma.statutoryContribution.create({ data })),
    );

    // Create / Update Return entity for tracking
    const returnType = dto.type === 'ALL' ? 'PF' : dto.type;
    await this.prisma.statutoryReturn.create({
      data: {
        companyId,
        establishmentId: dto.establishmentId,
        month: monthDate,
        type: returnType,
        version: nextVersion,
        filePath: '', // Populated upon file generation
        status: 'CALCULATED',
      },
    });

    return {
      version: nextVersion,
      month: dto.month,
      year: dto.year,
      epfo: {
        memberCount: epfoMemberCount,
        totalEmployeeContribution: totalEpfoEmployee,
        totalEmployerContribution: totalEpfoEmployer,
        grandTotal: totalEpfoEmployee + totalEpfoEmployer,
      },
      esic: {
        memberCount: esicMemberCount,
        totalEmployeeContribution: totalEsicEmployee,
        totalEmployerContribution: totalEsicEmployer,
        grandTotal: totalEsicEmployee + totalEsicEmployer,
      },
    };
  }
}

