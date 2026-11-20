import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PayrollService } from './payroll.service';
import {
  PayrollTierGuard,
  PayrollFeatureTier,
  PAYROLL_TIER_KEY,
} from './guards/payroll-tier.guard';
import { PayrollBatchQueueService } from './batch/payroll-batch-queue.service';

describe('Payroll SaaS Enterprise Features', () => {
  let payrollService: PayrollService;
  let batchQueueService: PayrollBatchQueueService;
  let tierGuard: PayrollTierGuard;
  let reflector: Reflector;

  const mockPrisma: any = {
    company: {
      findUnique: jest.fn(),
    },
    companySettings: {
      update: jest.fn(),
    },
    payrollBatchRun: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    salaryRevisionHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    payrollRecord: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    employee: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    salaryStructure: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    leaveRequest: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    attendance: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    holiday: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    employeeTaxDeclaration: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    employeeLoan: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    reflector = new Reflector();
    tierGuard = new PayrollTierGuard(reflector, mockPrisma);
    batchQueueService = new PayrollBatchQueueService(mockPrisma, null as any);
    payrollService = new PayrollService(
      mockPrisma,
      { getPresignedUrl: jest.fn() } as any,
      { logAction: jest.fn() } as any,
      { sendPayslipEmail: jest.fn() } as any,
      { generateForm16: jest.fn(), generateForm24Q: jest.fn() } as any,
      { generatePayrollJv: jest.fn() } as any,
      { calculateAndSnapshot: jest.fn() } as any,
      batchQueueService,
    );
  });

  describe('Feature B: Custom Cut-off Dates & Flexible Pay Cycles', () => {
    it('calculates standard calendar month when no custom cut-off configured', () => {
      const cycle = payrollService.getPayCycleDateRange(4, 2026, {
        payCycleType: 'CALENDAR_MONTH',
        payCycleStartDay: 1,
        payCycleEndDay: 0,
      });

      expect(cycle.cycleType).toBe('CALENDAR_MONTH');
      expect(cycle.startDay).toBe(1);
      expect(cycle.endDay).toBe(30);
      expect(cycle.daysInPeriod).toBe(30);
      expect(cycle.cycleStart.getUTCMonth()).toBe(3); // April
      expect(cycle.cycleStart.getUTCDate()).toBe(1);
      expect(cycle.cycleEnd.getUTCDate()).toBe(30);
    });

    it('calculates custom cut-off window spanning across previous month (26th to 25th)', () => {
      const cycle = payrollService.getPayCycleDateRange(4, 2026, {
        payCycleType: 'CUSTOM_CUTOFF',
        payCycleStartDay: 26,
        payCycleEndDay: 25,
      });

      expect(cycle.cycleType).toBe('CUSTOM_CUTOFF');
      expect(cycle.startDay).toBe(26);
      expect(cycle.endDay).toBe(25);
      // Starts March 26
      expect(cycle.cycleStart.getUTCMonth()).toBe(2); // March (0-indexed 2)
      expect(cycle.cycleStart.getUTCDate()).toBe(26);
      // Ends April 25
      expect(cycle.cycleEnd.getUTCMonth()).toBe(3); // April (0-indexed 3)
      expect(cycle.cycleEnd.getUTCDate()).toBe(25);
    });

    it('handles year rollover for January custom cut-off (Dec 26th of prev year to Jan 25th)', () => {
      const cycle = payrollService.getPayCycleDateRange(1, 2027, {
        payCycleType: 'CUSTOM_CUTOFF',
        payCycleStartDay: 26,
        payCycleEndDay: 25,
      });

      expect(cycle.cycleStart.getUTCFullYear()).toBe(2026);
      expect(cycle.cycleStart.getUTCMonth()).toBe(11); // Dec 2026
      expect(cycle.cycleStart.getUTCDate()).toBe(26);

      expect(cycle.cycleEnd.getUTCFullYear()).toBe(2027);
      expect(cycle.cycleEnd.getUTCMonth()).toBe(0); // Jan 2027
      expect(cycle.cycleEnd.getUTCDate()).toBe(25);
    });
  });

  describe('Feature A: Asynchronous Batch Payroll Queue Ticket Generation', () => {
    it('immediately returns a job ticket and offloads processing without blocking HTTP thread', async () => {
      mockPrisma.payrollBatchRun.findFirst.mockResolvedValue(null);
      mockPrisma.employee.findMany.mockResolvedValue([
        {
          id: 'emp-1',
          firstName: 'Alice',
          lastName: 'Smith',
          employeeCode: 'EMP001',
        },
        {
          id: 'emp-2',
          firstName: 'Bob',
          lastName: 'Jones',
          employeeCode: 'EMP002',
        },
      ]);
      mockPrisma.payrollBatchRun.create.mockResolvedValue({
        id: 'job-run-777',
        status: 'PROCESSING',
        totalEmployees: 2,
        month: 5,
        year: 2026,
      });

      const result = await batchQueueService.enqueueBatchRun(
        'comp-1',
        5,
        2026,
        'actor-1',
      );

      expect(result.jobId).toBe('job-run-777');
      expect(result.status).toBe('PROCESSING');
      expect(result.totalEmployees).toBe(2);
      expect(result.message).toContain('Batch payroll run initiated');
    });

    it('provides real-time progress percentage when polling the batch run ticket', async () => {
      mockPrisma.payrollBatchRun.findFirst.mockResolvedValue({
        id: 'job-run-777',
        status: 'PROCESSING',
        month: 5,
        year: 2026,
        totalEmployees: 1000,
        processedCount: 450,
        successCount: 440,
        failureCount: 5,
        skippedCount: 5,
        startedAt: new Date(),
        completedAt: null,
        departmentId: null,
      });

      const progress = await batchQueueService.getBatchRunProgress(
        'comp-1',
        'job-run-777',
      );

      expect(progress.jobId).toBe('job-run-777');
      expect(progress.status).toBe('PROCESSING');
      expect(progress.percentComplete).toBe(45); // 450 / 1000 = 45%
      expect(progress.processedCount).toBe(450);
      expect(progress.totalEmployees).toBe(1000);
    });
  });

  describe('Feature D: Subscription Tier Gating Guard', () => {
    const createMockContext = (
      companyPlan: string,
      requiredTier?: PayrollFeatureTier,
    ): ExecutionContext => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredTier);
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { companyId: 'comp-100', role: 'HR_HEAD' },
          }),
        }),
      } as any;
    };

    it('allows access to Starter features for Normal plan', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({
        subscription: 'NORMAL',
      });
      const context = createMockContext('NORMAL', PayrollFeatureTier.STARTER);

      const canActivate = await tierGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });

    it('blocks Normal (Starter) plan from accessing Growth statutory returns', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({
        subscription: 'NORMAL',
      });
      const context = createMockContext('NORMAL', PayrollFeatureTier.GROWTH);

      await expect(tierGuard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows Pro (Growth) plan to access Statutory returns', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ subscription: 'PRO' });
      const context = createMockContext('PRO', PayrollFeatureTier.GROWTH);

      const canActivate = await tierGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });

    it('blocks Pro (Growth) plan from accessing Enterprise JV and Form 24Q export', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({ subscription: 'PRO' });
      const context = createMockContext('PRO', PayrollFeatureTier.ENTERPRISE);

      await expect(tierGuard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('allows Enterprise plan to access all advanced payroll capabilities', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({
        subscription: 'ENTERPRISE',
      });
      const context = createMockContext(
        'ENTERPRISE',
        PayrollFeatureTier.ENTERPRISE,
      );

      const canActivate = await tierGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });

    it('grants full preview access during Free Trial', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({
        subscription: 'FREE_TRIAL',
      });
      const context = createMockContext(
        'FREE_TRIAL',
        PayrollFeatureTier.ENTERPRISE,
      );

      const canActivate = await tierGuard.canActivate(context);
      expect(canActivate).toBe(true);
    });
  });
});
