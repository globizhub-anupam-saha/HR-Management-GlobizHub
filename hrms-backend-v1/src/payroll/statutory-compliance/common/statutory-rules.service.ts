import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpsertStatutoryRuleDto } from '../dto/statutory-rule.dto';
import { Decimal } from '@prisma/client/runtime/library';

export const DEFAULT_STATUTORY_RATES: Record<string, number> = {
  EPF: 0.12,        // 12% employee share
  EPS: 0.0833,      // 8.33% employer pension
  EDLI: 0.005,      // 0.50% employer insurance
  EPF_ADMIN: 0.005, // 0.50% employer admin charges
  ESI_EE: 0.0075,   // 0.75% employee ESI
  ESI_ER: 0.0325,   // 3.25% employer ESI
};

@Injectable()
export class StatutoryRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveRules(establishmentId: string, asOfDate: Date = new Date()) {
    const rules = await this.prisma.statutoryRule.findMany({
      where: {
        establishmentId,
        effectiveFrom: { lte: asOfDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: asOfDate } },
        ],
      },
    });

    const rates: Record<string, number> = { ...DEFAULT_STATUTORY_RATES };
    for (const rule of rules) {
      rates[rule.category] = Number(rule.rate);
    }
    return rates;
  }

  async upsertRule(companyId: string, dto: UpsertStatutoryRuleDto) {
    // Ensure establishment belongs to company
    const establishment = await this.prisma.statutoryEstablishment.findFirst({
      where: { id: dto.establishmentId, companyId },
    });
    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    const effectiveFrom = new Date(dto.effectiveFrom);
    const effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : null;

    return this.prisma.statutoryRule.upsert({
      where: {
        establishmentId_category_effectiveFrom: {
          establishmentId: dto.establishmentId,
          category: dto.category,
          effectiveFrom,
        },
      },
      create: {
        establishmentId: dto.establishmentId,
        category: dto.category,
        rate: new Decimal(dto.rate),
        effectiveFrom,
        effectiveTo,
      },
      update: {
        rate: new Decimal(dto.rate),
        effectiveTo,
      },
    });
  }

  async listRules(companyId: string, establishmentId: string) {
    const establishment = await this.prisma.statutoryEstablishment.findFirst({
      where: { id: establishmentId, companyId },
    });
    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    return this.prisma.statutoryRule.findMany({
      where: { establishmentId },
      orderBy: { effectiveFrom: 'desc' },
    });
  }
}

