import {
  ModuleEntitlementGuard,
  REQUIRED_PLAN_MODULE_KEY,
} from './module-entitlement.guard';
import { ForbiddenException } from '@nestjs/common';

describe('ModuleEntitlementGuard', () => {
  let guard: ModuleEntitlementGuard;
  let reflector: any;
  let prisma: any;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    prisma = {
      organizationFeatureOverride: {
        findUnique: jest.fn(),
      },
      subscription: {
        findUnique: jest.fn(),
      },
      company: {
        findUnique: jest.fn(),
      },
    };
    guard = new ModuleEntitlementGuard(reflector, prisma);
  });

  const createMockContext = (user: any) => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  };

  it('should allow access if no plan module is required', async () => {
    reflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext({ companyId: 'comp-1' });
    const allowed = await guard.canActivate(context);
    expect(allowed).toBe(true);
  });

  it('should allow access if user is a Platform Super Admin', async () => {
    reflector.getAllAndOverride.mockReturnValue('payroll');
    const context = createMockContext({ isPlatform: true });
    const allowed = await guard.canActivate(context);
    expect(allowed).toBe(true);
  });

  it('should allow access if tenant has an active plan with the module enabled', async () => {
    reflector.getAllAndOverride.mockReturnValue('payroll');
    prisma.organizationFeatureOverride.findUnique.mockResolvedValue(null);
    prisma.subscription.findUnique.mockResolvedValue({
      plan: {
        name: 'Pro Tier',
        entitlements: [{ moduleKey: 'payroll', isEnabled: true }],
      },
    });

    const context = createMockContext({ companyId: 'comp-1' });
    const allowed = await guard.canActivate(context);
    expect(allowed).toBe(true);
  });

  it('should throw ForbiddenException if tenant active plan has the module disabled', async () => {
    reflector.getAllAndOverride.mockReturnValue('recruitment');
    prisma.organizationFeatureOverride.findUnique.mockResolvedValue(null);
    prisma.subscription.findUnique.mockResolvedValue({
      plan: {
        name: 'Starter Tier',
        entitlements: [{ moduleKey: 'recruitment', isEnabled: false }],
      },
    });

    const context = createMockContext({ companyId: 'comp-1' });
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should prioritize organization feature override over plan entitlement', async () => {
    reflector.getAllAndOverride.mockReturnValue('payroll');
    // Plan has payroll enabled, but company override explicitly disabled it!
    prisma.organizationFeatureOverride.findUnique.mockResolvedValue({
      moduleKey: 'payroll',
      isEnabled: false,
    });

    const context = createMockContext({ companyId: 'comp-1' });
    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
