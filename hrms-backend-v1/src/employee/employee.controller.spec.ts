import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';

describe('EmployeeController - Org Chart, GDPR Export & Anonymization', () => {
  let controller: EmployeeController;
  let employeeService: any;

  beforeEach(async () => {
    employeeService = {
      findAllByCompany: jest.fn(),
      getOrgChart: jest.fn(),
      exportEmployeeData: jest.fn(),
      anonymizeEmployee: jest.fn(),
      resendInvite: jest.fn(),
      bulkImportEmployees: jest.fn(),
      findEmployeeById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        { provide: EmployeeService, useValue: employeeService },
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOrgChart', () => {
    it('calls employeeService.getOrgChart with companyId from request', async () => {
      employeeService.getOrgChart.mockResolvedValue({
        roots: [],
        totalEmployees: 0,
      });

      const res = await controller.getOrgChart({
        user: { companyId: 'comp-100', sub: 'user-1' },
      });

      expect(employeeService.getOrgChart).toHaveBeenCalledWith('comp-100');
      expect(res).toEqual({ roots: [], totalEmployees: 0 });
    });
  });

  describe('exportMyData (Self-Service Data Portability)', () => {
    it('calls exportEmployeeData with companyId and user sub', async () => {
      employeeService.exportEmployeeData.mockResolvedValue({
        complianceStandard: 'GDPR_Article_15 / DPDP_Right_to_Access',
        subject: { id: 'user-1', firstName: 'John' },
      });

      const res = await controller.exportMyData({
        user: { companyId: 'comp-100', sub: 'user-1' },
      });

      expect(employeeService.exportEmployeeData).toHaveBeenCalledWith(
        'comp-100',
        'user-1',
      );
      expect(res.subject.id).toBe('user-1');
    });
  });

  describe('exportEmployeeData', () => {
    it('allows an employee to export their own data', async () => {
      employeeService.exportEmployeeData.mockResolvedValue({
        complianceStandard: 'GDPR_Article_15 / DPDP_Right_to_Access',
      });

      await controller.exportEmployeeData(
        { user: { companyId: 'comp-100', sub: 'emp-1', role: 'EMPLOYEE' } },
        'emp-1',
      );

      expect(employeeService.exportEmployeeData).toHaveBeenCalledWith(
        'comp-100',
        'emp-1',
      );
    });

    it('allows SUPER_ADMIN to export any employee data', async () => {
      employeeService.exportEmployeeData.mockResolvedValue({
        complianceStandard: 'GDPR_Article_15 / DPDP_Right_to_Access',
      });

      await controller.exportEmployeeData(
        {
          user: { companyId: 'comp-100', sub: 'admin-1', role: 'SUPER_ADMIN' },
        },
        'emp-2',
      );

      expect(employeeService.exportEmployeeData).toHaveBeenCalledWith(
        'comp-100',
        'emp-2',
      );
    });

    it('rejects regular EMPLOYEE attempting to export another employee data', async () => {
      await expect(
        controller.exportEmployeeData(
          { user: { companyId: 'comp-100', sub: 'emp-1', role: 'EMPLOYEE' } },
          'emp-2',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('anonymizeEmployee', () => {
    it('delegates to employeeService.anonymizeEmployee with companyId, employeeId, and actorId', async () => {
      employeeService.anonymizeEmployee.mockResolvedValue({
        success: true,
        message:
          'Employee personal data permanently anonymized in compliance with DPDP/GDPR.',
      });

      const res = await controller.anonymizeEmployee(
        {
          user: { companyId: 'comp-100', sub: 'admin-1', role: 'SUPER_ADMIN' },
        },
        'emp-to-erase',
      );

      expect(employeeService.anonymizeEmployee).toHaveBeenCalledWith(
        'comp-100',
        'emp-to-erase',
        'admin-1',
      );
      expect(res.success).toBe(true);
    });
  });

  describe('resendInvite', () => {
    it('delegates to employeeService.resendInvite with companyId, employeeId, and actorId', async () => {
      employeeService.resendInvite.mockResolvedValue({
        success: true,
        message: 'Invitation email resent successfully to employee@company.com',
      });

      const res = await controller.resendInvite(
        { user: { companyId: 'comp-100', sub: 'admin-1' } },
        'invited-emp-id',
      );

      expect(employeeService.resendInvite).toHaveBeenCalledWith(
        'comp-100',
        'invited-emp-id',
        'admin-1',
      );
      expect(res.success).toBe(true);
    });
  });

  describe('bulkImportEmployees', () => {
    it('delegates to employeeService.bulkImportEmployees with companyId, employees array, and actorId', async () => {
      const mockResult = {
        success: true,
        totalProcessed: 2,
        importedCount: 2,
        skippedCount: 0,
        imported: [],
        skipped: [],
      };
      employeeService.bulkImportEmployees.mockResolvedValue(mockResult);

      const rows = [
        { email: 'e1@test.com', firstName: 'E1' },
        { email: 'e2@test.com', firstName: 'E2' },
      ];

      const res = await controller.bulkImportEmployees(
        { user: { companyId: 'comp-100', sub: 'admin-1' } },
        { employees: rows },
      );

      expect(employeeService.bulkImportEmployees).toHaveBeenCalledWith(
        'comp-100',
        rows,
        'admin-1',
      );
      expect(res).toEqual(mockResult);
    });
  });
});
