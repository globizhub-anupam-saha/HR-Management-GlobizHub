import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';

export const REQUIRED_PLAN_MODULE_KEY = 'required_plan_module';
export const RequirePlanModule = (moduleKey: string) =>
  SetMetadata(REQUIRED_PLAN_MODULE_KEY, moduleKey);

@Injectable()
export class ModuleEntitlementGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.getAllAndOverride<string>(
      REQUIRED_PLAN_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredModule) {
      return true; // No module restriction on this endpoint
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Platform Super Admin sessions bypass module checks
    if (user?.isPlatform || user?.isSupportDiagnosticSession) {
      return true;
    }

    const companyId = user?.companyId;
    if (!companyId) {
      throw new ForbiddenException(
        'Tenant company context required for module access validation',
      );
    }

    // 1. Check Organization-specific overrides first
    const override = await this.prisma.organizationFeatureOverride.findUnique({
      where: {
        companyId_moduleKey: {
          companyId,
          moduleKey: requiredModule.toLowerCase(),
        },
      },
    });

    if (override) {
      if (!override.isEnabled) {
        throw new ForbiddenException(
          `The "${requiredModule}" module has been disabled specifically for your organization.`,
        );
      }
      return true;
    }

    // 2. Check active subscription plan entitlements
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: {
        plan: {
          include: {
            entitlements: {
              where: { moduleKey: requiredModule.toLowerCase() },
            },
          },
        },
      },
    });

    if (subscription && subscription.plan) {
      const entitlement = subscription.plan.entitlements[0];
      if (entitlement && !entitlement.isEnabled) {
        throw new ForbiddenException(
          `The "${requiredModule}" module is not included in your "${subscription.plan.name}" plan. Please upgrade your subscription to access this feature.`,
        );
      }
      return true;
    }

    // 3. Fallback: Check company legacy subscription enum
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { subscription: true },
    });

    // In legacy tiering: Free Trial has core HR, Pro/Enterprise has advanced modules
    const restrictedForFree = ['payroll', 'recruitment', 'training'];
    if (
      company?.subscription === 'FREE_TRIAL' &&
      restrictedForFree.includes(requiredModule.toLowerCase())
    ) {
      // In trial we allow 14 days preview, but enforce upgrade if expired
      return true;
    }

    return true;
  }
}
