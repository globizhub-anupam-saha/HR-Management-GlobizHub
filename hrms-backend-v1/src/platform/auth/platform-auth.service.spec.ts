import { Test, TestingModule } from '@nestjs/testing';
import { PlatformAuthService } from './platform-auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('PlatformAuthService', () => {
  let service: PlatformAuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(async () => {
    prisma = {
      platformUser: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      platformAuditLog: {
        create: jest.fn().mockReturnValue(Promise.resolve()),
      },
    };

    jwt = {
      signAsync: jest.fn().mockResolvedValue('mock_platform_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<PlatformAuthService>(PlatformAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if platform user does not exist', async () => {
      prisma.platformUser.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'unknown@saas.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if platform user is deactivated', async () => {
      prisma.platformUser.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'blocked@saas.com',
        isActive: false,
      });
      await expect(
        service.login({ email: 'blocked@saas.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should issue a platform-isolated token with isPlatform: true upon valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword!', 10);
      prisma.platformUser.findUnique.mockResolvedValue({
        id: 'super-admin-1',
        email: 'superadmin@globizhr.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      });
      prisma.platformUser.update.mockResolvedValue({});

      const result = await service.login({
        email: 'superadmin@globizhr.com',
        password: 'CorrectPassword!',
      });

      expect(result.access_token).toBe('mock_platform_jwt_token');
      expect(result.user.role).toBe('SUPER_ADMIN');
      expect(jwt.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'super-admin-1',
          role: 'SUPER_ADMIN',
          isPlatform: true,
        }),
        expect.any(Object),
      );
    });
  });

  describe('register', () => {
    it('should throw ConflictException if email is already taken', async () => {
      prisma.platformUser.findUnique.mockResolvedValue({ id: 'existing-id' });
      await expect(
        service.register({
          email: 'duplicate@saas.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
