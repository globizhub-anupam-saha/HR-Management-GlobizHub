import { Test, TestingModule } from '@nestjs/testing';
import { LeaveService } from './leave.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LeaveStatus, TransactionType } from '../../generated/prisma/client';

describe('LeaveService', () => {
  let service: LeaveService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      holiday: { findMany: jest.fn().mockResolvedValue([]) },
      companySettings: {
        findUnique: jest.fn().mockResolvedValue({
          workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        }),
      },
      leavePolicy: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
      },
      leaveAllocation: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      leaveRequest: {
        aggregate: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      leaveTransaction: {
        create: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: AuditService,
          useValue: {
            logAction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject invalid leave dates before querying Prisma', async () => {
    await expect(
      service.createLeaveRequest('emp-1', 'company-1', {
        type: 'CASUAL' as any,
        startDate: 'not-a-date',
        endDate: '2026-08-14',
        reason: 'Sick leave',
      }),
    ).rejects.toThrow('Invalid leave date');
  });

  describe('Withdraw Leave Request', () => {
    it('should withdraw a pending leave request', async () => {
      prisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'leave-1',
        employeeId: 'emp-1',
        companyId: 'comp-1',
        status: LeaveStatus.PENDING,
        startDate: new Date('2026-12-01'),
        endDate: new Date('2026-12-02'),
        totalDays: 2,
      });

      prisma.leaveRequest.update.mockResolvedValue({
        id: 'leave-1',
        status: LeaveStatus.WITHDRAWN,
      });

      const res = await service.withdrawLeaveRequest(
        'comp-1',
        'leave-1',
        'emp-1',
        'EMPLOYEE',
      );

      expect(prisma.leaveRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'leave-1' },
          data: { status: LeaveStatus.WITHDRAWN },
        }),
      );
      expect(res.status).toBe(LeaveStatus.WITHDRAWN);
    });

    it('should withdraw an approved future leave request and refund used days', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureEnd = new Date(futureDate);
      futureEnd.setDate(futureEnd.getDate() + 2);

      prisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'leave-2',
        employeeId: 'emp-1',
        companyId: 'comp-1',
        allocationId: 'alloc-1',
        status: LeaveStatus.APPROVED,
        startDate: futureDate,
        endDate: futureEnd,
        totalDays: 3,
      });

      prisma.leaveRequest.update.mockResolvedValue({
        id: 'leave-2',
        status: LeaveStatus.WITHDRAWN,
      });

      await service.withdrawLeaveRequest(
        'comp-1',
        'leave-2',
        'emp-1',
        'EMPLOYEE',
      );

      // Check allocation refund
      expect(prisma.leaveAllocation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'alloc-1' },
          data: { usedDays: { decrement: 3 } },
        }),
      );

      // Check ledger reversal transaction
      expect(prisma.leaveTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            allocationId: 'alloc-1',
            type: TransactionType.LEAVE_REVERSED,
            amount: 3,
          }),
        }),
      );
    });
  });

  describe('Rejection Reason & Approvals', () => {
    it('should record rejectionReason when rejecting a leave request', async () => {
      prisma.leaveRequest.findUnique.mockResolvedValue({
        id: 'leave-3',
        companyId: 'comp-1',
        status: LeaveStatus.PENDING,
      });

      prisma.leaveRequest.update.mockResolvedValue({
        id: 'leave-3',
        status: LeaveStatus.REJECTED,
        rejectionReason: 'Critical project milestone overlap',
      });

      const res = await service.updateLeaveStatus(
        'comp-1',
        'leave-3',
        LeaveStatus.REJECTED,
        'MANAGER',
        'mgr-1',
        'Critical project milestone overlap',
      );

      expect(prisma.leaveRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'leave-3' },
          data: expect.objectContaining({
            status: LeaveStatus.REJECTED,
            managerId: 'mgr-1',
            rejectionReason: 'Critical project milestone overlap',
          }),
        }),
      );
      expect(res.rejectionReason).toBe('Critical project milestone overlap');
    });

    it('should fetch pending approvals for managers and admins', async () => {
      prisma.leaveRequest.findMany.mockResolvedValue([
        { id: 'leave-4', status: LeaveStatus.PENDING },
      ]);

      const res = await service.getApprovals('comp-1', {
        sub: 'admin-1',
        role: 'SUPER_ADMIN',
      });
      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: 'comp-1',
            status: LeaveStatus.PENDING,
          }),
        }),
      );
      expect(res).toHaveLength(1);
    });
  });

  describe('Manual Leave Adjustment / Comp-Off', () => {
    it('should credit comp-off days to an employee allocation', async () => {
      prisma.leaveAllocation.findFirst.mockResolvedValue({
        id: 'alloc-comp',
        allocatedDays: 0,
      });

      prisma.leaveAllocation.update.mockResolvedValue({
        id: 'alloc-comp',
        allocatedDays: 2,
      });

      await service.adjustLeaveBalance(
        'comp-1',
        {
          employeeId: 'emp-1',
          type: 'COMP_OFF' as any,
          amount: 2,
          reason: 'Worked on Sunday production deployment',
        },
        'admin-1',
      );

      expect(prisma.leaveAllocation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'alloc-comp' },
          data: { allocatedDays: { increment: 2 } },
        }),
      );

      expect(prisma.leaveTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            allocationId: 'alloc-comp',
            type: TransactionType.ADJUSTMENT,
            amount: 2,
            description: 'Worked on Sunday production deployment',
          }),
        }),
      );
    });
  });
});
