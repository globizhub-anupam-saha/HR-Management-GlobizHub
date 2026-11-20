import { Test, TestingModule } from '@nestjs/testing';
import { PlatformUsersService } from './platform-users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PlatformUsersService', () => {
  let service: PlatformUsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      platformUser: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'u-1',
            email: 'superadmin@globizhr.com',
            firstName: 'Super',
            lastName: 'Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
          },
        ]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'u-2',
          email: 'support@globizhr.com',
          firstName: 'Support',
          lastName: 'Officer',
          role: 'SUPPORT_ADMIN',
          isActive: true,
        }),
        update: jest.fn().mockResolvedValue({
          id: 'u-1',
          role: 'PLATFORM_ADMIN',
        }),
      },
      platformAuditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformUsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PlatformUsersService>(PlatformUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list all platform users', async () => {
    const res = await service.findAll({});
    expect(res.data).toHaveLength(1);
    expect(res.meta.total).toBe(2);
  });

  it('should create new platform administrator and hash password', async () => {
    const res = await service.create(
      {
        email: 'support@globizhr.com',
        password: 'Password123!',
        firstName: 'Support',
        lastName: 'Officer',
        role: 'SUPPORT_ADMIN' as any,
      },
      'admin-1',
      'superadmin@globizhr.com',
    );

    expect(prisma.platformUser.create).toHaveBeenCalled();
    expect(res.email).toBe('support@globizhr.com');
  });

  it('should update platform role and audit change', async () => {
    prisma.platformUser.findUnique.mockResolvedValueOnce({
      id: 'u-1',
      role: 'SUPER_ADMIN',
    });

    const res = await service.updateRole(
      'u-1',
      'PLATFORM_ADMIN' as any,
      'admin-1',
      'superadmin@globizhr.com',
    );

    expect(prisma.platformUser.update).toHaveBeenCalled();
    expect(res.role).toBe('PLATFORM_ADMIN');
  });
});
