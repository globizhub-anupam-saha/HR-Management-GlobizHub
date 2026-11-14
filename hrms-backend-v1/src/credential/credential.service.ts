import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { VerifyCredentialDto } from './dto/verify-credential.dto';
import { CredentialType } from '../../generated/prisma/enums';

export interface CredentialStatusInfo {
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'LIFETIME';
  daysRemaining: number | null;
  isCompliant: boolean;
}

@Injectable()
export class CredentialService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to calculate expiry status and days remaining
   */
  private evaluateExpiryStatus(
    expiryDate: Date | null,
    doesNotExpire: boolean,
    verificationStatus: string,
  ): CredentialStatusInfo {
    if (doesNotExpire || !expiryDate) {
      return {
        status: 'LIFETIME',
        daysRemaining: null,
        isCompliant: verificationStatus === 'VERIFIED',
      };
    }

    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        status: 'EXPIRED',
        daysRemaining,
        isCompliant: false,
      };
    }

    if (daysRemaining <= 60) {
      return {
        status: 'EXPIRING_SOON',
        daysRemaining,
        isCompliant: verificationStatus === 'VERIFIED',
      };
    }

    return {
      status: 'ACTIVE',
      daysRemaining,
      isCompliant: verificationStatus === 'VERIFIED',
    };
  }

  async createCredential(
    companyId: string,
    targetEmployeeId: string,
    dto: CreateCredentialDto,
  ) {
    const employeeId = dto.employeeId || targetEmployeeId;

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found in your organization.');
    }

    const credential = await this.prisma.professionalCredential.create({
      data: {
        companyId,
        employeeId,
        title: dto.title,
        credentialType: dto.credentialType,
        registrationNumber: dto.registrationNumber,
        issuingAuthority: dto.issuingAuthority,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
        expiryDate:
          dto.doesNotExpire || !dto.expiryDate
            ? null
            : new Date(dto.expiryDate),
        doesNotExpire: dto.doesNotExpire || false,
        documentUrl: dto.documentUrl || null,
        notes: dto.notes || null,
        verificationStatus: 'PENDING',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        },
      },
    });

    const statusInfo = this.evaluateExpiryStatus(
      credential.expiryDate,
      credential.doesNotExpire,
      credential.verificationStatus,
    );

    return {
      message: 'Professional credential submitted successfully for verification.',
      credential: {
        ...credential,
        ...statusInfo,
      },
    };
  }

  async updateCredential(
    companyId: string,
    id: string,
    dto: UpdateCredentialDto,
  ) {
    const existing = await this.prisma.professionalCredential.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException('Credential record not found.');
    }

    const updated = await this.prisma.professionalCredential.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        credentialType: dto.credentialType ?? existing.credentialType,
        registrationNumber:
          dto.registrationNumber ?? existing.registrationNumber,
        issuingAuthority: dto.issuingAuthority ?? existing.issuingAuthority,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : existing.issueDate,
        expiryDate: dto.doesNotExpire
          ? null
          : dto.expiryDate
            ? new Date(dto.expiryDate)
            : existing.expiryDate,
        doesNotExpire: dto.doesNotExpire ?? existing.doesNotExpire,
        documentUrl: dto.documentUrl ?? existing.documentUrl,
        notes: dto.notes ?? existing.notes,
        // If renewed, reset status to PENDING verification
        verificationStatus: 'PENDING',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    const statusInfo = this.evaluateExpiryStatus(
      updated.expiryDate,
      updated.doesNotExpire,
      updated.verificationStatus,
    );

    return {
      message: 'Credential updated successfully.',
      credential: {
        ...updated,
        ...statusInfo,
      },
    };
  }

  async deleteCredential(companyId: string, id: string) {
    const existing = await this.prisma.professionalCredential.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException('Credential record not found.');
    }

    await this.prisma.professionalCredential.delete({ where: { id } });
    return { message: 'Credential deleted successfully.' };
  }

  async getEmployeeCredentials(companyId: string, employeeId: string) {
    const credentials = await this.prisma.professionalCredential.findMany({
      where: { companyId, employeeId },
      orderBy: { expiryDate: 'asc' },
    });

    return credentials.map((c) => ({
      ...c,
      ...this.evaluateExpiryStatus(
        c.expiryDate,
        c.doesNotExpire,
        c.verificationStatus,
      ),
    }));
  }

  async listCompanyCredentials(
    companyId: string,
    query: {
      credentialType?: CredentialType;
      verificationStatus?: string;
      expiringWithinDays?: number;
      search?: string;
    },
  ) {
    const whereClause: any = { companyId };

    if (query.credentialType) {
      whereClause.credentialType = query.credentialType;
    }
    if (query.verificationStatus) {
      whereClause.verificationStatus = query.verificationStatus;
    }

    if (query.expiringWithinDays) {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + query.expiringWithinDays);
      whereClause.expiryDate = {
        gte: now,
        lte: futureDate,
      };
      whereClause.doesNotExpire = false;
    }

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { registrationNumber: { contains: query.search, mode: 'insensitive' } },
        { issuingAuthority: { contains: query.search, mode: 'insensitive' } },
        {
          employee: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { employeeCode: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const credentials = await this.prisma.professionalCredential.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return credentials.map((c) => ({
      ...c,
      ...this.evaluateExpiryStatus(
        c.expiryDate,
        c.doesNotExpire,
        c.verificationStatus,
      ),
    }));
  }

  async verifyCredential(
    companyId: string,
    id: string,
    verifiedById: string,
    dto: VerifyCredentialDto,
  ) {
    const existing = await this.prisma.professionalCredential.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException('Credential record not found.');
    }

    const updated = await this.prisma.professionalCredential.update({
      where: { id },
      data: {
        verificationStatus: dto.status,
        verifiedById,
        verifiedAt: new Date(),
        rejectionReason:
          dto.status === 'REJECTED' ? dto.rejectionReason || 'Rejected by reviewer' : null,
      },
    });

    return {
      message: `Credential ${dto.status.toLowerCase()} successfully.`,
      credential: updated,
    };
  }

  async getComplianceDashboard(companyId: string) {
    const credentials = await this.prisma.professionalCredential.findMany({
      where: { companyId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        },
      },
    });

    let verifiedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let expiredCount = 0;
    let expiring30DaysCount = 0;
    let expiring60DaysCount = 0;
    let activeCount = 0;

    const urgentAlerts: any[] = [];
    const nonCompliantEmployeeIds = new Set<string>();
    const typeDistribution: Record<string, number> = {};

    for (const cred of credentials) {
      const typeKey = cred.credentialType;
      typeDistribution[typeKey] = (typeDistribution[typeKey] || 0) + 1;

      if (cred.verificationStatus === 'VERIFIED') verifiedCount++;
      else if (cred.verificationStatus === 'PENDING') {
        pendingCount++;
        nonCompliantEmployeeIds.add(cred.employeeId);
      } else if (cred.verificationStatus === 'REJECTED') {
        rejectedCount++;
        nonCompliantEmployeeIds.add(cred.employeeId);
      }

      const statusInfo = this.evaluateExpiryStatus(
        cred.expiryDate,
        cred.doesNotExpire,
        cred.verificationStatus,
      );

      if (statusInfo.status === 'EXPIRED') {
        expiredCount++;
        nonCompliantEmployeeIds.add(cred.employeeId);
        urgentAlerts.push({
          id: cred.id,
          employee: cred.employee,
          title: cred.title,
          credentialType: cred.credentialType,
          registrationNumber: cred.registrationNumber,
          expiryDate: cred.expiryDate,
          daysRemaining: statusInfo.daysRemaining,
          urgency: 'EXPIRED',
        });
      } else if (statusInfo.status === 'EXPIRING_SOON') {
        if ((statusInfo.daysRemaining || 0) <= 30) {
          expiring30DaysCount++;
          urgentAlerts.push({
            id: cred.id,
            employee: cred.employee,
            title: cred.title,
            credentialType: cred.credentialType,
            registrationNumber: cred.registrationNumber,
            expiryDate: cred.expiryDate,
            daysRemaining: statusInfo.daysRemaining,
            urgency: 'EXPIRING_30_DAYS',
          });
        } else {
          expiring60DaysCount++;
        }
      } else {
        activeCount++;
      }
    }

    return {
      summary: {
        totalCredentials: credentials.length,
        verifiedCount,
        pendingCount,
        rejectedCount,
        activeCount,
        expiring30DaysCount,
        expiring60DaysCount,
        expiredCount,
        nonCompliantStaffCount: nonCompliantEmployeeIds.size,
        overallComplianceRate:
          credentials.length > 0
            ? Math.round(
                ((credentials.length - nonCompliantEmployeeIds.size) /
                  credentials.length) *
                  100,
              )
            : 100,
      },
      typeDistribution,
      urgentAlerts: urgentAlerts.sort(
        (a, b) => (a.daysRemaining || 0) - (b.daysRemaining || 0),
      ),
    };
  }
}

