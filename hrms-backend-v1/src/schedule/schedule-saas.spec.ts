import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ScheduleService - Enterprise SaaS Features', () => {
  let service: ScheduleService;
  let prisma: any;
  let audit: any;

  const mockCompanyId = 'comp-100';
  const mockManagerId = 'mgr-200';
  const mockDeptId = 'dept-eng';

  beforeEach(async () => {
    prisma = {
      employee: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      shift: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
      schedule: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        upsert: jest.fn().mockResolvedValue({ id: 'sched-1' }),
      },
      shiftAssignmentOverride: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(prisma);
        }
        return Promise.all(cb);
      }),
    };

    audit = {
      logAction: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  describe('Manager RBAC Scoping (assertManagerScope)', () => {
    it('allows SUPER_ADMIN to target any employee without restrictions', async () => {
      await expect(
        (service as any).assertManagerScope(
          mockCompanyId,
          'admin-1',
          'SUPER_ADMIN',
          ['emp-1', 'emp-2'],
        ),
      ).resolves.not.toThrow();
    });

    it('rejects MANAGER if target employees belong to a different department', async () => {
      prisma.employee.findUnique.mockResolvedValue({
        id: mockManagerId,
        departmentId: mockDeptId,
        directReports: [],
      });
      prisma.employee.findMany.mockResolvedValue([
        {
          id: 'emp-1',
          departmentId: mockDeptId,
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          id: 'emp-2',
          departmentId: 'dept-sales',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      ]);

      await expect(
        (service as any).assertManagerScope(
          mockCompanyId,
          mockManagerId,
          'MANAGER',
          ['emp-1', 'emp-2'],
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows MANAGER when all target employees belong to manager department or report directly', async () => {
      prisma.employee.findUnique.mockResolvedValue({
        id: mockManagerId,
        departmentId: mockDeptId,
        directReports: [{ id: 'emp-2' }],
      });
      prisma.employee.findMany.mockResolvedValue([
        {
          id: 'emp-1',
          departmentId: mockDeptId,
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          id: 'emp-2',
          departmentId: 'dept-sales',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      ]);

      await expect(
        (service as any).assertManagerScope(
          mockCompanyId,
          mockManagerId,
          'MANAGER',
          ['emp-1', 'emp-2'],
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('Labor Law Compliance & Rest Period Validation', () => {
    const morningShift = {
      id: 'shift-morning',
      name: 'Morning Shift',
      startTime: '08:00',
      endTime: '16:00',
      isNightShift: false,
    };

    const nightShift = {
      id: 'shift-night',
      name: 'Night Shift',
      startTime: '20:00',
      endTime: '04:00',
      isNightShift: true,
    };

    it('detects a rest period violation when previous shift ends <11h before candidate shift', async () => {
      // Night shift ending at 04:00 on Nov 10, candidate morning shift starting at 08:00 on Nov 10 (4h rest)
      prisma.schedule.findFirst.mockResolvedValue({
        date: new Date(Date.UTC(2026, 10, 9)),
        shift: nightShift,
        isDayOff: false,
      });

      const conflicts = await service.validateShiftCompliance(
        mockCompanyId,
        'emp-1',
        new Date(Date.UTC(2026, 10, 10)),
        morningShift,
        false,
      );

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('REST_PERIOD_VIOLATION');
      expect(conflicts[0].message.toLowerCase()).toContain('rest period');
    });

    it('detects consecutive working days violation when employee works 7 consecutive days without day off', async () => {
      // Preceding 6 consecutive working days
      const priorDays = [3, 4, 5, 6, 7, 8].map((day) => ({
        date: new Date(Date.UTC(2026, 10, day)),
        shiftId: 'shift-morning',
        shift: morningShift,
        isDayOff: false,
      }));

      prisma.schedule.findMany.mockResolvedValue(priorDays);

      // Nov 9 would be the 7th consecutive working day
      const conflicts = await service.validateShiftCompliance(
        mockCompanyId,
        'emp-1',
        new Date(Date.UTC(2026, 10, 9)),
        morningShift,
        false,
      );

      const consecutiveConflict = conflicts.find(
        (c) => c.type === 'MAX_CONSECUTIVE_DAYS_VIOLATION',
      );
      expect(consecutiveConflict).toBeDefined();
      expect(consecutiveConflict?.message).toContain('consecutive');
    });

    it('returns empty conflicts when candidate day is a scheduled Day Off', async () => {
      const conflicts = await service.validateShiftCompliance(
        mockCompanyId,
        'emp-1',
        new Date(Date.UTC(2026, 10, 10)),
        null,
        true,
      );

      expect(conflicts).toEqual([]);
    });
  });

  describe('Bulk Schedule Assignment (bulkAssignSchedule)', () => {
    it('assigns schedules across date range and respects daysOfWeek filter', async () => {
      prisma.employee.findMany.mockResolvedValue([
        { id: 'emp-1', firstName: 'John', lastName: 'Doe' },
      ]);
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-1',
        name: 'General',
        startTime: '09:00',
        endTime: '17:00',
        isNightShift: false,
      });
      prisma.schedule.findMany.mockResolvedValue([]);
      prisma.schedule.upsert.mockResolvedValue({ id: 'sched-1' });

      // Monday Nov 9, 2026 (day 1) to Wednesday Nov 11, 2026 (day 3)
      const res = await service.bulkAssignSchedule(
        mockCompanyId,
        {
          employeeIds: ['emp-1'],
          shiftId: 'shift-1',
          startDate: '2026-11-09',
          endDate: '2026-11-11',
          daysOfWeek: [1, 2], // Only Mon and Tue, Wed (3) should be skipped
        },
        'SUPER_ADMIN',
        'admin-1',
      );

      expect(res.totalAssigned).toBe(2);
      expect(prisma.schedule.upsert).toHaveBeenCalledTimes(2);
    });

    it('returns requiresOverride: true if compliance conflicts occur without overrideConflict flag', async () => {
      prisma.employee.findMany.mockResolvedValue([
        { id: 'emp-1', firstName: 'John', lastName: 'Doe' },
      ]);
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-morning',
        name: 'Morning',
        startTime: '08:00',
        endTime: '16:00',
        isNightShift: false,
      });

      // Mock compliance conflict
      jest.spyOn(service, 'validateShiftCompliance').mockResolvedValue([
        {
          employeeId: 'emp-1',
          date: '2026-11-10',
          type: 'REST_PERIOD_VIOLATION',
          message: 'Insufficient rest',
          severity: 'ERROR',
        },
      ]);

      const res = await service.bulkAssignSchedule(
        mockCompanyId,
        {
          employeeIds: ['emp-1'],
          shiftId: 'shift-morning',
          startDate: '2026-11-10',
          endDate: '2026-11-10',
          overrideConflict: false,
        },
        'SUPER_ADMIN',
        'admin-1',
      );

      expect(res.success).toBe(false);
      expect(res.requiresOverride).toBe(true);
      expect(res.conflicts?.length).toBe(1);
    });
  });

  describe('Cyclical Rotational Pattern (applyRotationPattern)', () => {
    it('generates repeating rotation cycles correctly', async () => {
      prisma.employee.findMany.mockResolvedValue([
        { id: 'emp-1', firstName: 'Alice', lastName: 'Smith' },
      ]);
      prisma.shift.findMany.mockResolvedValue([
        {
          id: 'shift-morning',
          name: 'Morning',
          startTime: '08:00',
          endTime: '16:00',
          isNightShift: false,
        },
      ]);
      prisma.schedule.findMany.mockResolvedValue([]);
      prisma.schedule.upsert.mockResolvedValue({ id: 'sched-rot' });

      // Pattern: [Morning, Morning, Off]. 3 steps * 2 cycles = 6 days
      const res = await service.applyRotationPattern(
        mockCompanyId,
        {
          employeeIds: ['emp-1'],
          startDate: '2026-11-01',
          cycles: 2,
          pattern: [
            { shiftId: 'shift-morning', isDayOff: false },
            { shiftId: 'shift-morning', isDayOff: false },
            { shiftId: null, isDayOff: true },
          ],
        },
        'SUPER_ADMIN',
        'admin-1',
      );

      expect(res.totalAssigned).toBe(6);
      expect(prisma.schedule.upsert).toHaveBeenCalledTimes(6);
    });
  });

  describe('Visual Roster Matrix Grid (getRosterMatrix)', () => {
    it('aggregates employees, schedules, and active overrides into a grid structure', async () => {
      prisma.employee.findMany.mockResolvedValue([
        {
          id: 'emp-1',
          employeeCode: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          designation: { id: 'des-1', name: 'Developer' },
          department: { id: 'd-1', name: 'IT' },
        },
      ]);

      const testDate = new Date(Date.UTC(2026, 10, 10));
      prisma.schedule.findMany.mockResolvedValue([
        {
          id: 's-1',
          employeeId: 'emp-1',
          date: testDate,
          shiftId: 'shift-1',
          isDayOff: false,
          shift: {
            id: 'shift-1',
            name: 'Regular Day',
            startTime: '09:00',
            endTime: '17:00',
            isNightShift: false,
          },
        },
      ]);

      prisma.shiftAssignmentOverride.findMany.mockResolvedValue([]);

      const matrix = await service.getRosterMatrix(
        mockCompanyId,
        'admin-1',
        'SUPER_ADMIN',
        {
          startDate: '2026-11-10',
          endDate: '2026-11-10',
        },
      );

      expect(matrix.days).toEqual(['2026-11-10']);
      expect(matrix.matrix.length).toBe(1);
      expect(matrix.matrix[0].days['2026-11-10']).toBeDefined();
      expect(matrix.matrix[0].days['2026-11-10'].shiftName).toBe('Regular Day');
    });
  });
});
