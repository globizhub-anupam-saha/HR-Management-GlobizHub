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
  });
});
