import { Test, TestingModule } from '@nestjs/testing';
import { PlatformDashboardService } from './platform-dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PlatformSnapshotJob } from './platform-snapshot.job';

describe('PlatformDashboardService', () => {
  let service: PlatformDashboardService;
  let prisma: any;
  let snapshotJob: any;

  beforeEach(async () => {
    prisma = {
      company: {
        count: jest.fn().mockResolvedValue(10),
        findMany: jest.fn().mockResolvedValue([]),
      },
      employee: {
        count: jest.fn().mockResolvedValue(150),
      },
      supportTicket: {
        count: jest.fn().mockResolvedValue(3),
      },
      subscription: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'sub-1',
            status: 'ACTIVE',
            billingCycle: 'MONTHLY',
            plan: { monthlyPrice: 499, annualPrice: 4990 },
          },
        ]),
        count: jest.fn().mockResolvedValue(2),
      },
      payment: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 499 } }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      platformPlan: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      dailyPlatformSnapshot: {
        findMany: jest.fn().mockResolvedValue([
          {
            snapshotDate: new Date('2026-11-01'),
            mrr: 499,
            arr: 5988,
            collectedRevenue: 499,
            totalOrganizations: 10,
            activeOrganizations: 10,
            churnedCount: 0,
          },
        ]),
      },
      platformAuditLog: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    snapshotJob = {
      captureSnapshotForDate: jest.fn().mockResolvedValue({
        snapshotDate: new Date(),
        totalOrganizations: 10,
        mrr: 499,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformDashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: PlatformSnapshotJob, useValue: snapshotJob },
      ],
    }).compile();

    service = module.get<PlatformDashboardService>(PlatformDashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverview', () => {
    it('should aggregate Tier 1, Tier 2, and Tier 3 metrics in a single round-trip', async () => {
      const overview = await service.getOverview('30d');

      expect(overview.metrics.totalOrganizations.value).toBe(10);
      expect(overview.metrics.totalEmployees.value).toBe(150);
      expect(overview.metrics.mrr.current).toBe(499);
      expect(overview.metrics.arr.current).toBe(5988);
      expect(overview.charts.revenueTrend.length).toBe(1);
      expect(overview.tables.recentlyOnboardedOrgs).toBeDefined();
      expect(overview.tables.recentPayments).toBeDefined();
      expect(overview.tables.recentActivities).toBeDefined();
    });
  });

  describe('triggerSnapshotRecalculation', () => {
    it('should invoke snapshot capture and return recalculation result', async () => {
      const result = await service.triggerSnapshotRecalculation();
      expect(snapshotJob.captureSnapshotForDate).toHaveBeenCalled();
      expect(result.mrr).toBe(499);
    });
  });
});
