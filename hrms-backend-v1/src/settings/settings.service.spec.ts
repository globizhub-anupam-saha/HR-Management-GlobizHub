import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ForbiddenException } from '@nestjs/common';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: any;
  let auditService: any;

  beforeEach(async () => {
    prisma = {
      companySettings: {
        findUnique: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
    };
    auditService = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should return existing settings', async () => {
      const mockSettings = { companyId: 'comp-1', workingDays: ['MONDAY'] };
      prisma.companySettings.findUnique.mockResolvedValue(mockSettings);

      const res = await service.getSettings('comp-1');
      expect(res).toBe(mockSettings);
    });

    it('should auto-create default settings with Mon-Fri working days when missing', async () => {
      prisma.companySettings.findUnique.mockResolvedValue(null);
      prisma.companySettings.create.mockImplementation(({ data }: any) => ({
        id: 'new-set',
        ...data,
      }));

      const res = await service.getSettings('comp-1');
      expect(res.companyId).toBe('comp-1');
      expect(res.workingDays).toEqual([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
      ]);
    });
  });

  describe('updateSettings', () => {
    it('should throw ForbiddenException if user has non-admin role', async () => {
      await expect(
        service.updateSettings('comp-1', {}, 'EMPLOYEE'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should sanitize unknown fields and normalize workingDays to uppercase', async () => {
      prisma.companySettings.findUnique.mockResolvedValue({ id: 'old-set' });
      prisma.companySettings.upsert.mockImplementation(({ update }: any) => ({
        id: 'new-set',
        ...update,
      }));

      const inputDto = {
        companyName: 'Acme Corp',
        unknownRelationalField: { foo: 'bar' }, // unknown field to be stripped
        workingDays: ['monday', 'Tuesday', 'Friday'],
        minimumHoursForFullDay: '8.5', // numeric string
        halfDayMinHours: '4.25',
      };

      const res = await service.updateSettings(
        'comp-1',
        inputDto,
        'SUPER_ADMIN',
        'user-1',
      );
      expect(res.companyName).toBe('Acme Corp');
      expect((res as any).unknownRelationalField).toBeUndefined();
      expect(res.workingDays).toEqual(['MONDAY', 'TUESDAY', 'FRIDAY']);
      expect(res.minimumHoursForFullDay).toBe(8.5);
      expect(res.halfDayMinHours).toBe(4.25);
      expect(auditService.logAction).toHaveBeenCalledWith(
        'comp-1',
        'user-1',
        'UPDATE',
        'CompanySettings',
        'new-set',
        { id: 'old-set' },
        expect.anything(),
      );
    });
  });
});
