import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      branch: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      department: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      role: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      designation: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      employee: {
        count: jest.fn(),
      },
      jobRequisition: {
        count: jest.fn(),
      },
      manpowerRequisition: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteBranch', () => {
    it('should throw NotFoundException if branch not found', async () => {
      prisma.branch.findFirst.mockResolvedValue(null);
      await expect(service.deleteBranch('comp-1', 'br-99')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if departments belong to branch', async () => {
      prisma.branch.findFirst.mockResolvedValue({
        id: 'br-1',
        companyId: 'comp-1',
      });
      prisma.department.count.mockResolvedValue(2);

      await expect(service.deleteBranch('comp-1', 'br-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete branch when no departments belong to it', async () => {
      prisma.branch.findFirst.mockResolvedValue({
        id: 'br-1',
        companyId: 'comp-1',
      });
      prisma.department.count.mockResolvedValue(0);
      prisma.branch.delete.mockResolvedValue({ id: 'br-1' });

      const res = await service.deleteBranch('comp-1', 'br-1');
      expect(res).toEqual({ id: 'br-1' });
      expect(prisma.branch.delete).toHaveBeenCalledWith({
        where: { id: 'br-1' },
      });
    });
  });

  describe('deleteDepartment', () => {
    it('should throw NotFoundException if department not found', async () => {
      prisma.department.findFirst.mockResolvedValue(null);
      await expect(
        service.deleteDepartment('comp-1', 'dept-99'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if employees belong to department', async () => {
      prisma.department.findFirst.mockResolvedValue({
        id: 'dept-1',
        companyId: 'comp-1',
      });
      prisma.employee.count.mockResolvedValue(3);

      await expect(
        service.deleteDepartment('comp-1', 'dept-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if active job requisitions belong to department', async () => {
      prisma.department.findFirst.mockResolvedValue({
        id: 'dept-1',
        companyId: 'comp-1',
      });
      prisma.employee.count.mockResolvedValue(0);
      prisma.jobRequisition.count.mockResolvedValue(1);

      await expect(
        service.deleteDepartment('comp-1', 'dept-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delete department when safeguards pass', async () => {
      prisma.department.findFirst.mockResolvedValue({
        id: 'dept-1',
        companyId: 'comp-1',
      });
      prisma.employee.count.mockResolvedValue(0);
      prisma.jobRequisition.count.mockResolvedValue(0);
      prisma.role.count.mockResolvedValue(0);
      prisma.department.delete.mockResolvedValue({ id: 'dept-1' });

      const res = await service.deleteDepartment('comp-1', 'dept-1');
      expect(res).toEqual({ id: 'dept-1' });
    });
  });

  describe('deleteRole', () => {
    it('should throw NotFoundException if role not found', async () => {
      prisma.role.findFirst.mockResolvedValue(null);
      await expect(service.deleteRole('comp-1', 'role-99')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if employees are assigned to role', async () => {
      prisma.role.findFirst.mockResolvedValue({
        id: 'role-1',
        companyId: 'comp-1',
      });
      prisma.employee.count.mockResolvedValue(2);

      await expect(service.deleteRole('comp-1', 'role-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should delete role when no employees are assigned', async () => {
      prisma.role.findFirst.mockResolvedValue({
        id: 'role-1',
        companyId: 'comp-1',
      });
      prisma.employee.count.mockResolvedValue(0);
      prisma.role.delete.mockResolvedValue({ id: 'role-1' });

      const res = await service.deleteRole('comp-1', 'role-1');
      expect(res).toEqual({ id: 'role-1' });
    });
  });

  describe('getDesignationById', () => {
    it('should throw NotFoundException if designation is not found', async () => {
      prisma.designation.findFirst.mockResolvedValue(null);

      await expect(
        service.getDesignationById('company-1', 'desig-99'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return designation with employeeCount and requisitions count', async () => {
      prisma.designation.findFirst.mockResolvedValue({
        id: 'desig-1',
        name: 'Senior Engineer',
        companyId: 'company-1',
        _count: {
          employees: 5,
          jobRequisitions: 2,
          manpowerRequisitions: 1,
        },
        employees: [
          {
            id: 'emp-1',
            employeeCode: 'EMP001',
            firstName: 'Alice',
            lastName: 'Smith',
          },
        ],
      });

      const result = await service.getDesignationById('company-1', 'desig-1');
      expect(result.id).toBe('desig-1');
      expect(result.employeeCount).toBe(5);
      expect(result.jobRequisitionsCount).toBe(2);
      expect(result.manpowerRequisitionsCount).toBe(1);
    });
  });

  describe('deleteDesignation', () => {
    it('should throw NotFoundException if designation not found', async () => {
      prisma.designation.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteDesignation('company-1', 'desig-99'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if designation is default', async () => {
      prisma.designation.findFirst.mockResolvedValue({
        id: 'desig-default',
        companyId: 'company-1',
        isDefault: true,
      });

      await expect(
        service.deleteDesignation('company-1', 'desig-default'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if employees are assigned to designation', async () => {
      prisma.designation.findFirst.mockResolvedValue({
        id: 'desig-1',
        companyId: 'company-1',
        isDefault: false,
      });
      prisma.employee.count.mockResolvedValue(3);

      await expect(
        service.deleteDesignation('company-1', 'desig-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if active job requisitions exist for designation', async () => {
      prisma.designation.findFirst.mockResolvedValue({
        id: 'desig-1',
        companyId: 'company-1',
        isDefault: false,
      });
      prisma.employee.count.mockResolvedValue(0);
      prisma.jobRequisition.count.mockResolvedValue(2);

      await expect(
        service.deleteDesignation('company-1', 'desig-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if active manpower requisitions exist for designation', async () => {
      prisma.designation.findFirst.mockResolvedValue({
        id: 'desig-1',
        companyId: 'company-1',
        isDefault: false,
      });
      prisma.employee.count.mockResolvedValue(0);
      prisma.jobRequisition.count.mockResolvedValue(0);
      prisma.manpowerRequisition.count.mockResolvedValue(1);

      await expect(
        service.deleteDesignation('company-1', 'desig-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delete designation successfully when all safeguards pass', async () => {
      prisma.designation.findFirst.mockResolvedValue({
        id: 'desig-1',
        companyId: 'company-1',
        isDefault: false,
      });
      prisma.employee.count.mockResolvedValue(0);
      prisma.jobRequisition.count.mockResolvedValue(0);
      prisma.manpowerRequisition.count.mockResolvedValue(0);
      prisma.designation.delete.mockResolvedValue({ id: 'desig-1' });

      const result = await service.deleteDesignation('company-1', 'desig-1');
      expect(result).toEqual({ id: 'desig-1' });
      expect(prisma.designation.delete).toHaveBeenCalledWith({
        where: { id: 'desig-1' },
      });
    });
  });
});
