import { Test, TestingModule } from '@nestjs/testing';
import { PlatformMonitoringService } from './platform-monitoring.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PlatformMonitoringService', () => {
  let service: PlatformMonitoringService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
      platformAuditLog: {
        count: jest.fn().mockResolvedValue(12),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'audit-1',
            actorEmail: 'superadmin@globizhr.com',
            actorRole: 'SUPER_ADMIN',
            action: 'ORG_SUSPEND',
            targetEntity: 'Company',
            targetId: 'org-1',
            createdAt: new Date(),
          },
        ]),
      },
      company: {
        count: jest.fn().mockResolvedValue(15),
      },
      employee: {
        count: jest.fn().mockResolvedValue(250),
      },
      subscription: {
        count: jest.fn().mockResolvedValue(10),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformMonitoringService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PlatformMonitoringService>(PlatformMonitoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list audit logs with pagination', async () => {
    const res = await service.getAuditLogs({});
    expect(res.data).toHaveLength(1);
    expect(res.meta.total).toBe(12);
  });

  it('should return system health metrics', async () => {
    const health = await service.getSystemHealth();
    expect(health.status).toBe('OPERATIONAL');
    expect(health.database.status).toBe('HEALTHY');
    expect(health.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(health.memory.heapUsedMb).toBeGreaterThan(0);
    expect(health.metrics.totalTenants).toBe(15);
  });
});
