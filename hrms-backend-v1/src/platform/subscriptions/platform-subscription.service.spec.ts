import { Test, TestingModule } from '@nestjs/testing';
import { PlatformSubscriptionService } from './platform-subscription.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PlatformSubscriptionService', () => {
  let service: PlatformSubscriptionService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      platformPlan: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(4),
      },
      planEntitlement: {
        create: jest.fn(),
        upsert: jest.fn(),
      },
      subscription: {
        findMany: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn(),
      },
      company: {
        findUnique: jest.fn(),
      },
      organizationFeatureOverride: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      platformAuditLog: {
        create: jest.fn().mockReturnValue(Promise.resolve()),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformSubscriptionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PlatformSubscriptionService>(
      PlatformSubscriptionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPlans', () => {
    it('should return all plans ordered by price', async () => {
      prisma.platformPlan.findMany.mockResolvedValue([
        {
          id: 'plan-1',
          name: 'Starter Tier',
          monthlyPrice: 1499,
          entitlements: [],
        },
      ]);
      const plans = await service.getAllPlans();
      expect(plans.length).toBe(1);
      expect(plans[0].name).toBe('Starter Tier');
    });
  });

  describe('createPlan', () => {
    it('should throw ConflictException if plan code or name already exists', async () => {
      prisma.platformPlan.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(
        service.createPlan({
          name: 'Pro',
          code: 'PLAN_PRO',
          monthlyPrice: 4999,
          annualPrice: 49990,
          maxEmployees: 100,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create plan and seed entitlements', async () => {
      prisma.platformPlan.findFirst.mockResolvedValue(null);
      prisma.platformPlan.create.mockResolvedValue({
        id: 'new-plan-id',
        name: 'Enterprise Plus',
        code: 'PLAN_ENT_PLUS',
        monthlyPrice: 19999,
        annualPrice: 199990,
        maxEmployees: 2000,
      });
      prisma.platformPlan.findUnique.mockResolvedValue({
        id: 'new-plan-id',
        name: 'Enterprise Plus',
        code: 'PLAN_ENT_PLUS',
        entitlements: [],
      });

      const plan = await service.createPlan({
        name: 'Enterprise Plus',
        code: 'PLAN_ENT_PLUS',
        monthlyPrice: 19999,
        annualPrice: 199990,
        maxEmployees: 2000,
      });

      expect(plan.id).toBe('new-plan-id');
      expect(prisma.planEntitlement.create).toHaveBeenCalled();
    });
  });

  describe('updateEntitlements', () => {
    it('should upsert entitlements for a plan', async () => {
      prisma.platformPlan.findUnique.mockResolvedValue({ id: 'plan-1' });
      prisma.planEntitlement.upsert.mockResolvedValue({});

      await service.updateEntitlements('plan-1', {
        entitlements: [
          { moduleKey: 'payroll', isEnabled: true },
          { moduleKey: 'recruitment', isEnabled: false },
        ],
      });

      expect(prisma.planEntitlement.upsert).toHaveBeenCalledTimes(2);
    });
  });
});
