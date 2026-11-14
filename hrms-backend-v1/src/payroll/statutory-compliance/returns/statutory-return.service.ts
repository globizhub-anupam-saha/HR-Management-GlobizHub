import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EpfoCalculatorService } from '../epfo/epfo-calculator.service';
import { EpfoEcrGeneratorService } from '../epfo/epfo-ecr-generator.service';
import { EcrMemberRecord } from '../epfo/epfo-provider.interface';
import { EsicCalculatorService } from '../esic/esic-calculator.service';
import { EsicFileGeneratorService } from '../esic/esic-file-generator.service';
import { EsicMemberRecord } from '../esic/esic-provider.interface';
import { StatutoryRulesService } from '../common/statutory-rules.service';
import {
  GenerateStatutoryFileDto,
  SubmitStatutoryReturnDto,
  CreateChallanDto,
  RecordStatutoryPaymentDto,
} from '../dto/statutory-operations.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class StatutoryReturnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rulesService: StatutoryRulesService,
    private readonly epfoCalculator: EpfoCalculatorService,
    private readonly epfoGenerator: EpfoEcrGeneratorService,
    private readonly esicCalculator: EsicCalculatorService,
    private readonly esicGenerator: EsicFileGeneratorService,
  ) {}

  /**
   * Generates the official government return file (EPFO .txt ECR or ESIC file)
   */
  async generateReturnFile(companyId: string, dto: GenerateStatutoryFileDto) {
    const establishment = await this.prisma.statutoryEstablishment.findFirst({
      where: { id: dto.establishmentId, companyId },
    });
    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    const monthDate = new Date(Date.UTC(dto.year, dto.month - 1, 1));

    // Find the latest statutory return for this month and establishment
    let statutoryReturn = await this.prisma.statutoryReturn.findFirst({
      where: {
        companyId,
        establishmentId: dto.establishmentId,
        month: monthDate,
        type: dto.type,
      },
      orderBy: { version: 'desc' },
    });

    const version = statutoryReturn ? statutoryReturn.version : 1;

    // Fetch payroll records for this month
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
        `No payroll records found for ${dto.month}/${dto.year}. Please run payroll for this month first before generating the return file.`,
      );
    }

    const rates = await this.rulesService.getActiveRules(dto.establishmentId, monthDate);

    let fileContent = '';
    let fileName = '';
    let summary: any = {};

    if (dto.type === 'PF') {
      const records: EcrMemberRecord[] = [];
      for (const pr of payrollRecords) {
        const stat =
          pr.employee.statutoryProfiles?.find(
            (sp) => sp.establishmentId === dto.establishmentId,
          ) || pr.employee.statutoryProfiles?.[0];
        const uan = stat?.epfoUan || pr.employee.uanNumber;
        if (uan) {
          records.push(
            this.epfoCalculator.calculateMember({
              uan,
              memberName: `${pr.employee.firstName} ${pr.employee.lastName}`,
              grossSalary: pr.basicPay + pr.allowances,
              basicSalary: pr.basicPay,
              unpaidLeaves: pr.unpaidLeaves,
              totalWorkingDays: pr.totalWorkingDays,
              rates,
            }),
          );
        }
      }

      if (records.length === 0) {
        throw new BadRequestException(
          'No employees with a configured EPFO UAN found in this month\'s payroll records. Please ensure employees have their UAN entered.',
        );
      }

      const ecrResult = this.epfoGenerator.generateEcrText(records);
      fileContent = ecrResult.content;
      fileName = `EPFO_ECR_${establishment.epfoEstablishmentCode || 'EST'}_${dto.year}_${String(dto.month).padStart(2, '0')}.txt`;
      summary = ecrResult;
    } else {
      const records: EsicMemberRecord[] = [];
      for (const pr of payrollRecords) {
        const stat =
          pr.employee.statutoryProfiles?.find(
            (sp) => sp.establishmentId === dto.establishmentId,
          ) || pr.employee.statutoryProfiles?.[0];
        const ipNumber = stat?.esicIpNumber;
        if (ipNumber) {
          const res = this.esicCalculator.calculateMember({
            ipNumber,
            ipName: `${pr.employee.firstName} ${pr.employee.lastName}`,
            grossSalary: pr.basicPay + pr.allowances,
            totalWorkingDays: pr.totalWorkingDays,
            presentDays: pr.presentDays,
            unpaidLeaves: pr.unpaidLeaves,
            rates,
          });
          if (res) records.push(res);
        }
      }

      if (records.length === 0) {
        throw new BadRequestException(
          'No employees with a configured ESIC IP Number found in this month\'s payroll records. Please ensure employees have their ESIC IP Number entered.',
        );
      }

      const esicResult = this.esicGenerator.generateEsicContributionFile(records);
      fileContent = esicResult.content;
      fileName = `ESIC_CONTRIBUTION_${establishment.esicEmployerCode || 'EST'}_${dto.year}_${String(dto.month).padStart(2, '0')}.csv`;
      summary = esicResult;
    }

    // Update return status
    if (!statutoryReturn) {
      statutoryReturn = await this.prisma.statutoryReturn.create({
        data: {
          companyId,
          establishmentId: dto.establishmentId,
          month: monthDate,
          type: dto.type,
          version,
          filePath: fileName,
          status: 'AWAITING_PORTAL_SUBMISSION',
        },
      });
    } else {
      statutoryReturn = await this.prisma.statutoryReturn.update({
        where: { id: statutoryReturn.id },
        data: {
          filePath: fileName,
          status: 'AWAITING_PORTAL_SUBMISSION',
        },
      });
    }

    return {
      returnId: statutoryReturn.id,
      fileName,
      type: dto.type,
      fileContent, // Returned directly for download
      status: statutoryReturn.status,
      summary,
    };
  }

  /**
   * HR records that the return was uploaded to the government portal
   */
  async recordPortalSubmission(companyId: string, dto: SubmitStatutoryReturnDto) {
    const statutoryReturn = await this.prisma.statutoryReturn.findFirst({
      where: { id: dto.returnId, companyId },
    });
    if (!statutoryReturn) {
      throw new NotFoundException('Statutory return not found');
    }

    // Create submission entry
    const submission = await this.prisma.statutorySubmission.create({
      data: {
        returnId: dto.returnId,
        portalReference: dto.portalReference,
        documentPath: dto.documentPath,
        status: 'SUBMITTED',
      },
    });

    await this.prisma.statutoryReturn.update({
      where: { id: dto.returnId },
      data: { status: 'PORTAL_ACCEPTED' },
    });

    return submission;
  }

  /**
   * Create Challan with TRRN generated on government portal
   */
  async createChallan(companyId: string, dto: CreateChallanDto) {
    const statutoryReturn = await this.prisma.statutoryReturn.findFirst({
      where: { id: dto.returnId, companyId },
    });
    if (!statutoryReturn) {
      throw new NotFoundException('Statutory return not found');
    }

    const challan = await this.prisma.statutoryChallan.create({
      data: {
        returnId: dto.returnId,
        challanNumber: dto.challanNumber,
        trrn: dto.trrn,
        amount: new Decimal(dto.amount),
        dueDate: new Date(dto.dueDate),
        status: 'AWAITING_PAYMENT',
      },
    });

    await this.prisma.statutoryReturn.update({
      where: { id: dto.returnId },
      data: { status: 'CHALLAN_GENERATED' },
    });

    return challan;
  }

  /**
   * Record government payment reference & official payment receipt
   */
  async recordPayment(companyId: string, dto: RecordStatutoryPaymentDto) {
    const challan = await this.prisma.statutoryChallan.findFirst({
      where: { id: dto.challanId, return: { companyId } },
      include: { return: true },
    });
    if (!challan) {
      throw new NotFoundException('Challan not found');
    }

    const payment = await this.prisma.statutoryPayment.create({
      data: {
        challanId: dto.challanId,
        paymentReference: dto.paymentReference,
        amount: new Decimal(dto.amount),
        currency: 'INR',
        paymentDate: new Date(dto.paymentDate),
        method: dto.method,
        status: 'RECORDED',
      },
    });

    // Update challan status & receipt document
    await this.prisma.statutoryChallan.update({
      where: { id: dto.challanId },
      data: {
        status: 'PAID',
        receiptPath: dto.receiptPath,
      },
    });

    // Update return status
    await this.prisma.statutoryReturn.update({
      where: { id: challan.returnId },
      data: { status: 'PAID' },
    });

    return payment;
  }

  /**
   * List returns for an establishment and year
   */
  async listReturns(companyId: string, establishmentId?: string, year?: number) {
    const where: any = { companyId };
    if (establishmentId) where.establishmentId = establishmentId;
    if (year) {
      const start = new Date(Date.UTC(year, 0, 1));
      const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
      where.month = { gte: start, lte: end };
    }

    return this.prisma.statutoryReturn.findMany({
      where,
      include: {
        establishment: true,
        submissions: true,
        challans: {
          include: {
            payments: true,
          },
        },
      },
      orderBy: { month: 'desc' },
    });
  }
}

