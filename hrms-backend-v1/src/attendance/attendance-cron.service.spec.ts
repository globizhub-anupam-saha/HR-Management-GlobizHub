import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceCronService } from './attendance-cron.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AttendanceCronService', () => {
  let service: AttendanceCronService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      employee: {
        findMany: jest.fn(),
      },
      attendance: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      shiftAssignmentOverride: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      schedule: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      holiday: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      leaveRequest: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      shift: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      attendanceSession: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceCronService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AttendanceCronService>(AttendanceCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should skip absent marking if today is a non-working day (e.g. Weekend)', async () => {
    prisma.employee.findMany.mockResolvedValue([
      {
        id: 'emp-1',
        companyId: 'comp-1',
        company: {
          settings: {
            workingDays: ['NOT_TODAY'], // Guaranteed non-matching day
            gracePeriodMinutes: 15,
          },
        },
      },
    ]);

    prisma.attendance.findFirst.mockResolvedValue(null);

    await service.handleDailyAttendanceCalculation();

    expect(prisma.attendance.create).not.toHaveBeenCalled();
  });

  it('should skip absent marking if today is a public holiday', async () => {
    prisma.employee.findMany.mockResolvedValue([
      {
        id: 'emp-1',
        companyId: 'comp-1',
        company: {
          settings: {
            workingDays: [
              'SUNDAY',
              'MONDAY',
              'TUESDAY',
              'WEDNESDAY',
              'THURSDAY',
              'FRIDAY',
              'SATURDAY',
            ],
            gracePeriodMinutes: 15,
          },
        },
      },
    ]);

    prisma.attendance.findFirst.mockResolvedValue(null);
    prisma.holiday.findFirst.mockResolvedValue({ id: 'hol-1', name: 'Diwali' });

    await service.handleDailyAttendanceCalculation();

    expect(prisma.attendance.create).not.toHaveBeenCalled();
  });

  it('should mark ON_LEAVE instead of ABSENT if employee holds an approved leave', async () => {
    prisma.employee.findMany.mockResolvedValue([
      {
        id: 'emp-1',
        companyId: 'comp-1',
        company: {
          settings: {
            workingDays: [
              'SUNDAY',
              'MONDAY',
              'TUESDAY',
              'WEDNESDAY',
              'THURSDAY',
              'FRIDAY',
              'SATURDAY',
            ],
            gracePeriodMinutes: 15,
          },
        },
      },
    ]);

    prisma.attendance.findFirst.mockResolvedValue(null);
    prisma.leaveRequest.findFirst.mockResolvedValue({
      id: 'leave-1',
      status: 'APPROVED',
      type: 'CASUAL',
    });

    await service.handleDailyAttendanceCalculation();

    expect(prisma.attendance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employeeId: 'emp-1',
          status: 'ON_LEAVE',
        }),
      }),
    );
  });

  it('should evaluate HALF_DAY when working hours are between halfDayMinHours and minimumHoursForFullDay', async () => {
    const today = new Date();
    today.setHours(9, 0, 0, 0);

    const checkOut = new Date(today);
    checkOut.setHours(14, 0, 0, 0); // 5 hours worked

    prisma.employee.findMany.mockResolvedValue([
      {
        id: 'emp-1',
        companyId: 'comp-1',
        company: {
          settings: {
            minimumHoursForFullDay: 8.0,
            halfDayMinHours: 4.0,
            gracePeriodMinutes: 15,
          },
        },
      },
    ]);

    prisma.attendance.findFirst.mockResolvedValue({
      id: 'att-1',
      checkInTime: today,
      checkOutTime: checkOut,
      status: 'PRESENT',
      shiftId: null,
      isCrossMidnight: false,
    });

    await service.handleDailyAttendanceCalculation();

    expect(prisma.attendance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'att-1' },
        data: expect.objectContaining({
          status: 'HALF_DAY',
          isHalfDay: true,
          workingHours: 5,
        }),
      }),
    );
  });
});
