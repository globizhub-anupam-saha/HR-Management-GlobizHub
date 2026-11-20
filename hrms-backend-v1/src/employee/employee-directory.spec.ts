import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { AuditService } from '../audit/audit.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('EmployeeService - Directory Search, Filter & Resend Invite', () => {
  let service: EmployeeService;
  let prisma: any;
  let audit: any;

  const mockCompanyId = 'comp-100';

  beforeEach(async () => {
    prisma = {
      employee: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
      },
      department: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'dept-eng', name: 'Engineering' }]),
      },
      designation: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'desig-dev', name: 'Developer' }]),
      },
      onboardingCase: {
        create: jest.fn().mockResolvedValue({ id: 'case-1' }),
      },
      task: {
        create: jest.fn().mockResolvedValue({ id: 'task-1' }),
      },
    };

    audit = {
      logAction: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: PrismaService, useValue: prisma },
        { provide: S3Service, useValue: {} },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    (service as any).resend = {
      emails: {
        send: jest.fn().mockResolvedValue({ data: { id: 'email-1' } }),
      },
    };
  });

  describe('findAllByCompany with Query Filters', () => {
    it('applies employmentStatus filter when status is provided and not ALL', async () => {
      await service.findAllByCompany(mockCompanyId, { status: 'INVITED' });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: mockCompanyId,
            employmentStatus: 'INVITED',
          }),
          select: expect.objectContaining({
            employmentStatus: true,
          }),
        }),
      );
    });

    it('does not restrict employmentStatus when status is ALL', async () => {
      await service.findAllByCompany(mockCompanyId, { status: 'ALL' });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: mockCompanyId },
        }),
      );
    });

    it('filters by departmentId when provided', async () => {
      await service.findAllByCompany(mockCompanyId, {
        departmentId: 'dept-eng',
      });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: mockCompanyId,
            departmentId: 'dept-eng',
          }),
        }),
      );
    });

    it('applies case-insensitive search across name, email and employeeCode', async () => {
      await service.findAllByCompany(mockCompanyId, { search: 'Alice' });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: mockCompanyId,
            OR: [
              { firstName: { contains: 'Alice', mode: 'insensitive' } },
              { lastName: { contains: 'Alice', mode: 'insensitive' } },
              { email: { contains: 'Alice', mode: 'insensitive' } },
              { employeeCode: { contains: 'Alice', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('resendInvite', () => {
    it('throws NotFoundException if employee is not found', async () => {
      prisma.employee.findFirst.mockResolvedValue(null);

      await expect(
        service.resendInvite(mockCompanyId, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if employee is already ACTIVE or not INVITED', async () => {
      prisma.employee.findFirst.mockResolvedValue({
        id: 'emp-1',
        employmentStatus: 'ACTIVE',
        email: 'active@company.com',
      });

      await expect(
        service.resendInvite(mockCompanyId, 'emp-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('successfully regenerates token, sends email, and logs audit for INVITED employee', async () => {
      prisma.employee.findFirst.mockResolvedValue({
        id: 'emp-2',
        firstName: 'Bob',
        employmentStatus: 'INVITED',
        email: 'bob@company.com',
      });
      prisma.employee.update.mockResolvedValue({ id: 'emp-2' });

      const res = await service.resendInvite(mockCompanyId, 'emp-2', 'admin-1');

      expect(res.success).toBe(true);
      expect(prisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'emp-2' },
          data: expect.objectContaining({
            inviteToken: expect.any(String),
            resetPasswordExpires: expect.any(Date),
          }),
        }),
      );
      expect(audit.logAction).toHaveBeenCalled();
    });
  });

  describe('bulkImportEmployees', () => {
    it('returns empty result when input array is empty', async () => {
      const res = await service.bulkImportEmployees(mockCompanyId, []);
      expect(res.totalProcessed).toBe(0);
      expect(res.importedCount).toBe(0);
      expect(res.skippedCount).toBe(0);
    });

    it('processes rows, matches department/designation, creates employee & onboarding case', async () => {
      // Mock existing check: no one exists yet
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.employee.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'emp-new-1',
          email: args.data.email,
          firstName: args.data.firstName,
          lastName: args.data.lastName,
          employmentStatus: args.data.employmentStatus,
          departmentId: args.data.departmentId,
          designationId: args.data.designationId,
        }),
      );

      const rows = [
        {
          firstName: 'Alice',
          lastName: 'Wonder',
          email: 'alice@company.com',
          department: 'engineering',
          designation: 'developer',
          role: 'EMPLOYEE',
        },
      ];

      const res = await service.bulkImportEmployees(
        mockCompanyId,
        rows,
        'admin-1',
      );

      expect(res.totalProcessed).toBe(1);
      expect(res.importedCount).toBe(1);
      expect(res.skippedCount).toBe(0);
      expect(res.imported[0].email).toBe('alice@company.com');

      expect(prisma.employee.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: mockCompanyId,
            email: 'alice@company.com',
            employmentStatus: 'INVITED',
            departmentId: 'dept-eng',
            designationId: 'desig-dev',
            role: 'EMPLOYEE',
          }),
        }),
      );

      expect(prisma.onboardingCase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: mockCompanyId,
            employeeId: 'emp-new-1',
            status: 'INVITED',
          }),
        }),
      );
      expect(audit.logAction).toHaveBeenCalled();
    });

    it('skips existing emails and invalid rows', async () => {
      prisma.employee.findMany.mockResolvedValue([
        { email: 'existing@company.com' },
      ]);

      const rows = [
        { email: 'invalid-email', firstName: 'Bad' },
        { email: 'existing@company.com', firstName: 'Exists' },
      ];

      const res = await service.bulkImportEmployees(
        mockCompanyId,
        rows,
        'admin-1',
      );

      expect(res.totalProcessed).toBe(2);
      expect(res.importedCount).toBe(0);
      expect(res.skippedCount).toBe(2);
      expect(res.skipped[0].reason).toContain('Invalid or missing email');
      expect(res.skipped[1].reason).toContain('already exists');
    });
  });
});
