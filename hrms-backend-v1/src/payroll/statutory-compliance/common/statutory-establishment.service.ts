import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEstablishmentDto, UpdateEstablishmentDto } from '../dto/establishment.dto';
import { UpsertEmployeeStatutoryProfileDto } from '../dto/employee-statutory-profile.dto';

@Injectable()
export class StatutoryEstablishmentService {
  constructor(private readonly prisma: PrismaService) {}

  async listEstablishments(companyId: string) {
    return this.prisma.statutoryEstablishment.findMany({
      where: { companyId },
      include: {
        configurations: true,
        _count: {
          select: {
            employeeProfiles: true,
            returns: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getEstablishment(companyId: string, id: string) {
    const establishment = await this.prisma.statutoryEstablishment.findFirst({
      where: { id, companyId },
      include: {
        configurations: true,
        rules: {
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    });
    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }
    return establishment;
  }

  async createEstablishment(companyId: string, dto: CreateEstablishmentDto) {
    return this.prisma.statutoryEstablishment.create({
      data: {
        companyId,
        name: dto.name,
        epfoEstablishmentCode: dto.epfoEstablishmentCode,
        epfoExtension: dto.epfoExtension,
        esicEmployerCode: dto.esicEmployerCode,
        registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : null,
      },
    });
  }

  async updateEstablishment(companyId: string, id: string, dto: UpdateEstablishmentDto) {
    const exists = await this.prisma.statutoryEstablishment.findFirst({
      where: { id, companyId },
    });
    if (!exists) {
      throw new NotFoundException('Establishment not found');
    }

    return this.prisma.statutoryEstablishment.update({
      where: { id },
      data: {
        name: dto.name,
        epfoEstablishmentCode: dto.epfoEstablishmentCode,
        epfoExtension: dto.epfoExtension,
        esicEmployerCode: dto.esicEmployerCode,
        registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : undefined,
      },
    });
  }

  async upsertEmployeeProfile(companyId: string, dto: UpsertEmployeeStatutoryProfileDto) {
    // Validate establishment belongs to company
    const establishment = await this.prisma.statutoryEstablishment.findFirst({
      where: { id: dto.establishmentId, companyId },
    });
    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    // Validate employee belongs to company
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const effectiveFrom = dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date();
    const effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : null;

    return this.prisma.employeeStatutoryProfile.upsert({
      where: {
        employeeId_establishmentId_effectiveFrom: {
          employeeId: dto.employeeId,
          establishmentId: dto.establishmentId,
          effectiveFrom,
        },
      },
      create: {
        employeeId: dto.employeeId,
        establishmentId: dto.establishmentId,
        epfoUan: dto.epfoUan,
        esicIpNumber: dto.esicIpNumber,
        effectiveFrom,
        effectiveTo,
      },
      update: {
        epfoUan: dto.epfoUan,
        esicIpNumber: dto.esicIpNumber,
        effectiveTo,
      },
    });
  }

  async listEmployeeProfiles(companyId: string, establishmentId: string) {
    const establishment = await this.prisma.statutoryEstablishment.findFirst({
      where: { id: establishmentId, companyId },
    });
    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    return this.prisma.employeeStatutoryProfile.findMany({
      where: { establishmentId },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        },
      },
      orderBy: { employee: { firstName: 'asc' } },
    });
  }
}

