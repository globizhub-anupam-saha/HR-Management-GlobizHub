import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export enum PayrollFeatureTier {
  STARTER = 'NORMAL', // Salary calculation + Payslips
  GROWTH = 'PRO', // + Statutory Returns (EPFO, ESIC, PT, TDS)
  ENTERPRISE = 'ENTERPRISE', // + Accounting JV, Form 24Q, Form 16/16A, Multi-branch, Custom Cut-offs, Arrears
}

export const PAYROLL_TIER_KEY = 'payroll_feature_tier';
export const RequirePayrollTier = (minTier: PayrollFeatureTier) =>
  SetMetadata(PAYROLL_TIER_KEY, minTier);

const TIER_WEIGHTS: Record<string, number> = {
  FREE_TRIAL: 3, // Full evaluation preview during trial
  NORMAL: 1, // Starter Plan
  PRO: 2, // Growth Plan
  ENTERPRISE: 3, // Enterprise Plan
};

@Injectable()
export class PayrollTierGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.getAllAndOverride<PayrollFeatureTier>(
      PAYROLL_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTier) {
      return true; // No tier restriction on this endpoint
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Platform Super Admin and Platform service tokens bypass tier restrictions
    if (user?.isPlatform || user?.role === 'SUPER_ADMIN') {
      return true;
    }

    const companyId = user?.companyId;
    if (!companyId) {
      throw new ForbiddenException(
        'Tenant company context required for plan entitlement validation',
      );
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { subscription: true, name: true },
    });

    const currentPlan = company?.subscription || 'NORMAL';
    const currentWeight = TIER_WEIGHTS[currentPlan] ?? 1;
    const requiredWeight = TIER_WEIGHTS[requiredTier] ?? 1;

    if (currentWeight < requiredWeight) {
      const planName =
        requiredTier === PayrollFeatureTier.ENTERPRISE
          ? 'Enterprise'
          : requiredTier === PayrollFeatureTier.GROWTH
            ? 'Growth (Pro)'
            : 'Starter';

      throw new ForbiddenException(
        `This feature requires the ${planName} Plan. Your organization is currently on the ${currentPlan} tier. Please upgrade your subscription to unlock this feature.`,
      );
    }

    return true;
  }
}
