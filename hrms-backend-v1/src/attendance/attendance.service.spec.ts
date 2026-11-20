import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      attendance: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      attendanceCorrection: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      companySettings: {
        findUnique: jest.fn().mockResolvedValue({
          minimumHoursForFullDay: 8.0,
          halfDayMinHours: 4.0,
          allowedRadiusMeters: 100,
          enableGps: false,
          isIpRestrictionOn: false,
        }),
      },
      employee: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      leaveRequest: {
        findMany: jest.fn().mockResolvedValue([]),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCompanyAttendanceRecords & export', () => {
    it('should aggregate company attendance records and compute stats correctly', async () => {
      prisma.employee.findMany.mockResolvedValue([
        {
          id: 'emp-1',
          employeeCode: 'EMP001',
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
          profilePhoto: null,
          role: 'EMPLOYEE',
          departmentId: 'dept-1',
          department: { id: 'dept-1', name: 'Engineering' },
          designation: { id: 'des-1', name: 'Software Engineer' },
        },
        {
          id: 'emp-2',
          employeeCode: 'EMP002',
          firstName: 'Bob',
          lastName: 'Jones',
          email: 'bob@example.com',
          profilePhoto: null,
          role: 'EMPLOYEE',
          departmentId: 'dept-2',
          department: { id: 'dept-2', name: 'Marketing' },
          designation: { id: 'des-2', name: 'Marketer' },
        },
      ]);

      prisma.attendance.findMany.mockResolvedValue([
        {
          id: 'att-1',
          employeeId: 'emp-1',
          date: new Date('2026-11-13'),
          status: 'PRESENT',
          checkInTime: new Date('2026-11-13T09:00:00Z'),
          checkOutTime: new Date('2026-11-13T17:30:00Z'),
          workingHours: 8.5,
          overtimeHours: 0,
          isLate: false,
          isHalfDay: false,
          verificationMethod: 'GPS',
          shift: { name: 'Morning Shift' },
        },
      ]);

      const result = await service.getCompanyAttendanceRecords('comp-1', {
        date: '2026-11-13',
      });

      expect(result.stats.total).toBe(2);
      expect(result.stats.present).toBe(1);
      expect(result.stats.absent).toBe(1);
      expect(result.records).toHaveLength(2);
      expect(result.records[0].name).toBe('Alice Smith');
      expect(result.records[0].status).toBe('PRESENT');
      expect(result.records[1].name).toBe('Bob Jones');
      expect(result.records[1].status).toBe('ABSENT');
    });

    it('should export attendance records into formatted CSV with UTF-8 BOM', async () => {
      prisma.employee.findMany.mockResolvedValue([
        {
          id: 'emp-1',
          employeeCode: 'EMP001',
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
          profilePhoto: null,
          role: 'EMPLOYEE',
          departmentId: 'dept-1',
          department: { id: 'dept-1', name: 'Engineering' },
          designation: { id: 'des-1', name: 'Software Engineer' },
        },
      ]);

      prisma.attendance.findMany.mockResolvedValue([]);

      const csv = await service.exportCompanyAttendanceCsv('comp-1', {
        date: '2026-11-13',
      });

      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('Employee ID,Employee Name,Email,Department');
      expect(csv).toContain(
        '"EMP001","Alice Smith","alice@example.com","Engineering"',
      );
      expect(csv).toContain('"ABSENT"');
    });
  });

  describe('Attendance Corrections / Regularization', () => {
    it('should submit an attendance correction request', async () => {
      prisma.attendance.findFirst.mockResolvedValue({ id: 'att-1' });
      prisma.attendanceCorrection.create.mockResolvedValue({
        id: 'corr-1',
        employeeId: 'emp-1',
        status: 'PENDING',
      });

      const res = await service.requestCorrection('emp-1', {
        date: new Date('2026-11-12'),
        reason: 'Forgot to clock in due to bad weather',
      });

      expect(prisma.attendanceCorrection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employeeId: 'emp-1',
            reason: 'Forgot to clock in due to bad weather',
            status: 'PENDING',
          }),
        }),
      );
      expect(res.id).toBe('corr-1');
    });

    it('should mark HALF_DAY on approved correction when working hours are below minimum full day threshold', async () => {
      prisma.attendanceCorrection.findUnique.mockResolvedValue({
        id: 'corr-1',
        employeeId: 'emp-1',
        employee: { companyId: 'comp-1' },
        date: new Date('2026-11-12'),
        requestedCheckIn: new Date('2026-11-12T09:00:00Z'),
        requestedCheckOut: new Date('2026-11-12T14:00:00Z'), // 5 hours worked (< 8 hrs full day)
      });
      prisma.attendanceCorrection.update.mockResolvedValue({
        id: 'corr-1',
        status: 'APPROVED',
      });

      await service.reviewCorrection(
        'corr-1',
        'reviewer-1',
        'comp-1',
        'APPROVED',
        'Approved for half day',
      );

      expect(prisma.attendance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'HALF_DAY',
            isHalfDay: true,
            workingHours: 5,
          }),
        }),
      );
    });
  });
});
