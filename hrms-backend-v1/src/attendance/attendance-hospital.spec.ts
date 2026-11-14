import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AttendanceService - Cross-Midnight & Multi-Punch Spec', () => {
  let service: AttendanceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      attendance: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      attendanceSession: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      companySettings: {
        findUnique: jest.fn(),
      },
      shift: {
        findUnique: jest.fn(),
      },
      schedule: {
        findFirst: jest.fn(),
      },
      shiftAssignmentOverride: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  describe('IT 9-to-5 Fixed Schedule Guard (allowMultiPunch = false)', () => {
    it('should reject second clock-in if an IT employee already clocked out today', async () => {
      // No unclosed session from past 28 hours
      prisma.attendance.findFirst
        .mockResolvedValueOnce(null) // unclosed check
        .mockResolvedValueOnce({
          id: 'att-1',
          checkInTime: new Date(Date.now() - 8 * 3600000),
          checkOutTime: new Date(Date.now() - 1 * 3600000), // Already clocked out
        });

      prisma.companySettings.findUnique.mockResolvedValue({
        allowMultiPunch: false, // Standard IT company policy
        enableGps: false,
        isIpRestrictionOn: false,
      });

      prisma.shiftAssignmentOverride.findFirst.mockResolvedValue(null);
      prisma.schedule.findFirst.mockResolvedValue({ shiftId: 'shift-9to5' });
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-9to5',
        startTime: '09:00',
        endTime: '18:00',
        isNightShift: false,
        allowMultiPunch: false,
      });

      await expect(
        service.clockIn('emp-1', 'comp-1', {} as any, '127.0.0.1'),
      ).rejects.toThrow(
        new BadRequestException('You have already completed your attendance for today.'),
      );
    });
  });

  describe('Hospital / Split-Shift Multi-Punch (allowMultiPunch = true)', () => {
    it('should allow second session for hospital staff and open new active session', async () => {
      const existingAttendance = {
        id: 'att-hosp-1',
        checkInTime: new Date(Date.now() - 8 * 3600000),
        checkOutTime: new Date(Date.now() - 4 * 3600000), // First session ended
      };

      prisma.attendance.findFirst
        .mockResolvedValueOnce(null) // No unclosed session
        .mockResolvedValueOnce(existingAttendance); // Existing completed attendance for today

      prisma.companySettings.findUnique.mockResolvedValue({
        allowMultiPunch: true, // Hospital setting enabled
        enableGps: false,
        isIpRestrictionOn: false,
      });

      prisma.shiftAssignmentOverride.findFirst.mockResolvedValue(null);
      prisma.schedule.findFirst.mockResolvedValue({ shiftId: 'shift-ward' });
      prisma.shift.findUnique.mockResolvedValue({
        id: 'shift-ward',
        startTime: '07:00',
        endTime: '19:00',
        isNightShift: false,
        allowMultiPunch: true,
      });

      prisma.attendanceSession.count.mockResolvedValue(1);
      prisma.attendanceSession.create.mockResolvedValue({
        id: 'sess-2',
        sessionIndex: 2,
        checkInTime: new Date(),
      });
      prisma.attendance.update.mockResolvedValue({
        ...existingAttendance,
        checkOutTime: null,
      });

      const result = await service.clockIn('doctor-1', 'hospital-1', {} as any, '127.0.0.1');
      expect(result.message).toContain('session #2');
      expect(prisma.attendanceSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sessionIndex: 2,
          }),
        }),
      );
    });
  });

  describe('Cross-Midnight Night Shift Checkout', () => {
    it('should match and close active night shift session started on previous day', async () => {
      const yesterdayNight = new Date(Date.now() - 10 * 3600000);
      const activeNightAttendance = {
        id: 'att-night-1',
        checkInTime: yesterdayNight,
        checkOutTime: null, // Still active
        isCrossMidnight: true,
        shift: {
          startTime: '20:00',
          endTime: '08:00',
          isNightShift: true,
        },
        sessions: [
          {
            id: 'sess-night-1',
            checkInTime: yesterdayNight,
            checkOutTime: null,
          },
        ],
      };

      prisma.attendance.findFirst.mockResolvedValue(activeNightAttendance);
      prisma.attendanceSession.update.mockResolvedValue({});
      prisma.attendanceSession.findMany.mockResolvedValue([
        { id: 'sess-night-1', workingHours: 10 },
      ]);
      prisma.attendance.update.mockResolvedValue({
        ...activeNightAttendance,
        workingHours: 10,
        checkOutTime: new Date(),
      });

      const res = await service.clockOut('nurse-1', 'hospital-1');
      expect(res.message).toBe('Successfully clocked out!');
      expect(res.totalWorkingHours).toBe(10);
      expect(prisma.attendance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att-night-1' },
          data: expect.objectContaining({
            workingHours: 10,
          }),
        }),
      );
    });
  });
});

