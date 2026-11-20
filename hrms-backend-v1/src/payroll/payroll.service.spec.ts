import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';

import { Form16GeneratorService } from './tax/form16-generator.service';
import { PayrollJvService } from './journal/payroll-jv.service';
import { StatutoryCalculatorService } from './statutory-compliance/common/statutory-calculator.service';
import { PayrollBatchQueueService } from './batch/payroll-batch-queue.service';

describe('PayrollService', () => {
  let service: PayrollService;
  const prisma = {
    employee: {
      findFirst: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
    },
    salaryStructure: {
      findUnique: jest.fn(),
    },
    payrollRecord: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    leaveRequest: {
      findMany: jest.fn(),
    },
    attendance: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    holiday: {
      findMany: jest.fn(),
    },
    employeeTaxDeclaration: {
      findFirst: jest.fn(),
    },
    employeeLoan: {
      findFirst: jest.fn(),
    },
    employeeStatutoryProfile: {
      findFirst: jest.fn(),
    },
    salaryRevisionHistory: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const s3Service = {
    getPresignedUrl: jest.fn(),
  };
  const auditService = {
    logAction: jest.fn(),
  };
  const emailService = {
    sendPayrollSlipsEmail: jest.fn(),
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: S3Service,
          useValue: s3Service,
        },
        {
          provide: AuditService,
          useValue: auditService,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
        {
          provide: Form16GeneratorService,
          useValue: { generateForm16: jest.fn(), generateForm24Q: jest.fn() },
        },
        {
          provide: PayrollJvService,
          useValue: { generatePayrollJv: jest.fn() },
        },
        {
          provide: StatutoryCalculatorService,
          useValue: { calculateAndSnapshot: jest.fn() },
        },
        {
          provide: PayrollBatchQueueService,
          useValue: {
            enqueueBatchRun: jest.fn(),
            getBatchRunProgress: jest.fn(),
            listBatchRuns: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMonthlyPayroll', () => {
    beforeEach(() => {
      // Mock employee with active salary structure
      prisma.employee.findFirst.mockResolvedValue({
        id: 'employee-1',
        companyId: 'company-1',
        employmentStatus: 'ACTIVE',
        salaryStructure: {
          basicSalary: 30000,
          hra: 5000,
          otherAllowances: 2000,
          conveyanceAllowance: 1600,
          medicalAllowance: 1250,
          specialAllowance: 5000,
          pfContribution: 1800,
          taxDeduction: 2500,
          professionalTax: 200,
        },
      });

      prisma.salaryStructure.findUnique.mockResolvedValue({
        basicSalary: 30000,
        hra: 5000,
        otherAllowances: 2000,
        conveyanceAllowance: 1600,
        medicalAllowance: 1250,
        specialAllowance: 5000,
        pfContribution: 1800,
        taxDeduction: 2500,
        professionalTax: 200,
      });

      prisma.company.findUnique.mockResolvedValue({
        name: 'Test Company',
        settings: { payslipHeaderUrl: null },
      });

      // No double processing (payroll record doesn't exist yet)
      prisma.payrollRecord.findFirst.mockResolvedValue(null);

      // Overlapping leaves (empty by default)
      prisma.leaveRequest.findMany.mockResolvedValue([]);

      // Mock attendance records (overtime hours = 5)
      prisma.attendance.findMany.mockResolvedValue([
        { status: 'PRESENT', isHalfDay: false, overtimeHours: 5 },
      ]);

      // Mock attendance summary (overtime hours = 5)
      prisma.attendance.aggregate.mockResolvedValue({
        _sum: { overtimeHours: 5 },
      });

      // Mock holiday list (empty by default)
      prisma.holiday.findMany.mockResolvedValue([]);

      // Mock payroll record creation
      prisma.payrollRecord.create.mockResolvedValue({
        id: 'payroll-1',
        employeeId: 'employee-1',
        month: 5,
        year: 2026,
        netSalary: 31450,
      });
    });

    it('creates a payroll draft for a valid employee', async () => {
      await expect(
        service.generateMonthlyPayroll(
          'company-1',
          'employee-1',
          5,
          2026,
          'processor-1',
        ),
      ).resolves.toEqual(
        expect.objectContaining({
          id: 'payroll-1',
          employeeId: 'employee-1',
          month: 5,
          year: 2026,
        }),
      );

      expect(prisma.payrollRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employeeId: 'employee-1',
            month: 5,
            year: 2026,
            status: 'DRAFT',
            overtimeHours: 5,
          }),
        }),
      );
    });

    it('throws BadRequestException when payroll has already been generated', async () => {
      prisma.payrollRecord.findFirst.mockResolvedValue({
        id: 'existing-payroll',
      });

      await expect(
        service.generateMonthlyPayroll(
          'company-1',
          'employee-1',
          5,
          2026,
          'processor-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when salary structure is missing', async () => {
      prisma.employee.findFirst.mockResolvedValue({
        id: 'employee-1',
        companyId: 'company-1',
        employmentStatus: 'ACTIVE',
        salaryStructure: null,
      });
      prisma.salaryStructure.findUnique.mockResolvedValue(null);

      await expect(
        service.generateMonthlyPayroll(
          'company-1',
          'employee-1',
          5,
          2026,
          'processor-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('calculates night shift allowance when night shifts are worked', async () => {
      prisma.company.findUnique.mockResolvedValue({
        name: 'Test Company',
        settings: {
          payslipHeaderUrl: null,
          nightShiftAllowanceRate: 250, // Rs. 250 per night shift
        },
      });

      // 2 night shifts attended
      prisma.attendance.findMany.mockResolvedValue([
        {
          status: 'PRESENT',
          isHalfDay: false,
          overtimeHours: 0,
          shift: { isNightShift: true },
        },
        {
          status: 'PRESENT',
          isHalfDay: false,
          overtimeHours: 0,
          shift: { isNightShift: true },
        },
      ]);

      await service.generateMonthlyPayroll(
        'company-1',
        'employee-1',
        5,
        2026,
        'processor-1',
      );

      expect(prisma.payrollRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nightShiftAllowance: 500, // 2 * 250 = 500
          }),
        }),
      );
    });
  });

  describe('generateMonthlySalarySheetCsv', () => {
    it('throws NotFoundException when no payroll records exist for the month', async () => {
      prisma.payrollRecord.findMany.mockResolvedValue([]);

      await expect(
        service.generateMonthlySalarySheetCsv('company-1', 5, 2026),
      ).rejects.toThrow(NotFoundException);
    });

    it('generates comprehensive salary sheet CSV with exact EPFO ECR standard columns and UTF-8 BOM', async () => {
      prisma.payrollRecord.findMany.mockResolvedValue([
        {
          id: 'pay-1',
          month: 5,
          year: 2026,
          totalWorkingDays: 22,
          presentDays: 20,
          unpaidLeaves: 2,
          basicPay: 25000,
          allowances: 15000,
          arrearsPay: 2000,
          deductions: 3500,
          netSalary: 38500,
          tdsDeduction: 1200,
          overtimeHours: 4,
          employee: {
            employeeCode: 'EMP-001',
            firstName: 'Rahul',
            lastName: 'Sharma',
            uanNumber: '100123456789',
            panNumber: null,
            bankName: null,
            accountNumber: null,
            ifscCode: null,
            department: { name: 'Engineering' },
            designation: { name: 'Senior Developer' },
            statutoryProfiles: [
              { epfoUan: '100123456789', esicIpNumber: null },
            ],
          },
        },
      ]);

      const csv = await service.generateMonthlySalarySheetCsv(
        'company-1',
        5,
        2026,
      );

      // Verify UTF-8 BOM for Excel compatibility
      expect(csv.startsWith('\uFEFF')).toBe(true);

      // Verify EPFO ECR headers are present
      expect(csv).toContain(
        'UAN,Member Name,Gross Wages,EPF Wages,EPS Wages,EDLI Wages',
      );
      expect(csv).toContain(
        'EE Share Remitted (12%),EPS Share Remitted (8.33%),ER EPF Difference (3.67%),NCP Days',
      );
      expect(csv).toContain(
        'Scheduled Working Days,Days Present,Unpaid Days (LOP),Basic Pay,Allowances,Arrears',
      );

      // Verify calculated values
      // Gross = 25000 + 15000 + 2000 = 42000
      // EPF Wage capped at 15000
      // EE 12% = 1800
      // ER EPS 8.33% = 1250
      // ER EPF diff = 1800 - 1250 = 550
      // NCP days = 2
      expect(csv).toContain('100123456789');
      expect(csv).toContain('"Rahul Sharma"');
      expect(csv).toContain('42000'); // Gross Wages
      expect(csv).toContain('15000'); // EPF Wages
      expect(csv).toContain('1800'); // EE 12%
      expect(csv).toContain('1250'); // ER EPS
      expect(csv).toContain('550'); // ER Diff
      expect(csv).toContain('38500.00'); // Net Salary
    });
  });
});
