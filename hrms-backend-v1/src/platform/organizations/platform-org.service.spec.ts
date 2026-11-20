import { Test, TestingModule } from '@nestjs/testing';
import { PlatformOrgService } from './platform-org.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';

describe('PlatformOrgService', () => {
  let service: PlatformOrgService;
  let prisma: any;
  let jwt: any;

  beforeEach(async () => {
    prisma = {
      company: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      employee: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      platformAuditLog: {
        findMany: jest.fn(),
        create: jest.fn().mockReturnValue(Promise.resolve()),
      },
      auditLog: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    jwt = {
      signAsync: jest.fn().mockResolvedValue('mock_diagnostic_session_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformOrgService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<PlatformOrgService>(PlatformOrgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated organizations with metadata', async () => {
      prisma.company.count.mockResolvedValue(1);
      prisma.company.findMany.mockResolvedValue([
        {
          id: 'org-1',
          name: 'Acme Corp',
          email: 'admin@acme.com',
          status: 'VERIFIED',
          subscription: 'PRO',
          _count: { employees: 25, attendances: 120, supportTickets: 2 },
          subscriptions: [],
        },
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].employeeCount).toBe(25);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if organization does not exist', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should aggregate 9-tab inspection data', async () => {
      prisma.company.findUnique.mockResolvedValue({
        id: 'org-1',
        name: 'Acme Corp',
        status: 'VERIFIED',
        subscription: 'PRO',
        settings: { attendanceMethod: 'GPS' },
        subscriptions: [],
        invoices: [],
        featureOverrides: [],
        supportTickets: [],
        _count: {
          employees: 10,
          departments: 2,
          branches: 1,
          attendances: 50,
          leaveRequests: 5,
          tasks: 8,
          supportTickets: 1,
        },
      });
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.platformAuditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.findMany.mockResolvedValue([]);

      const result = await service.findOne('org-1');
      expect(result.overview.name).toBe('Acme Corp');
      expect(result.companyInfo).toBeDefined();
      expect(result.subscription).toBeDefined();
      expect(result.employees).toBeDefined();
      expect(result.usage).toBeDefined();
      expect(result.activityHistory).toBeDefined();
      expect(result.billingHistory).toBeDefined();
      expect(result.security).toBeDefined();
      expect(result.support).toBeDefined();
    });
  });

  describe('updateStatus', () => {
    it('should update organization status and log platform audit event', async () => {
      prisma.company.findUnique.mockResolvedValue({
        id: 'org-1',
        name: 'Acme Corp',
        status: 'VERIFIED',
      });
      prisma.company.update.mockResolvedValue({
        id: 'org-1',
        status: 'SUSPENDED',
      });

      const updated = await service.updateStatus(
        'org-1',
        { status: 'SUSPENDED', reason: 'Non-payment' },
        'admin-1',
        'superadmin@globizhr.com',
      );

      expect(updated.status).toBe('SUSPENDED');
      expect(prisma.company.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'org-1' },
          data: { status: 'SUSPENDED' },
        }),
      );
    });
  });

  describe('createAccessSession', () => {
    it('should issue a diagnostic token and record mandatory audit log', async () => {
      prisma.company.findUnique.mockResolvedValue({
        id: 'org-1',
        name: 'Acme Corp',
        status: 'VERIFIED',
      });
      prisma.platformAuditLog.create.mockResolvedValue({});

      const session = await service.createAccessSession(
        'org-1',
        { reason: 'Customer ticket #102 payroll error', durationMinutes: 30 },
        'admin-1',
        'superadmin@globizhr.com',
      );

      expect(session.diagnosticToken).toBe('mock_diagnostic_session_token');
      expect(session.durationMinutes).toBe(30);
      expect(prisma.platformAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'SUPPORT_SESSION_START',
            reason: 'Customer ticket #102 payroll error',
            companyId: 'org-1',
          }),
        }),
      );
    });
  });
});
