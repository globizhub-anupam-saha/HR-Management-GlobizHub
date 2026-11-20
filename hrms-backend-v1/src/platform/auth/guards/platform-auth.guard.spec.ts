import { PlatformAuthGuard } from './platform-auth.guard';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('PlatformAuthGuard', () => {
  let guard: PlatformAuthGuard;
  let jwtService: any;
  let prismaService: any;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    };
    prismaService = {
      platformUser: {
        findUnique: jest.fn(),
      },
    };
    process.env.JWT_SECRET =
      'test_jwt_secret_must_be_long_enough_32_bytes_test';
    guard = new PlatformAuthGuard(jwtService, prismaService);
  });

  const createMockContext = (authHeader?: string) => {
    const request: any = {
      headers: {
        authorization: authHeader,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;
  };

  it('should throw UnauthorizedException if no token is present', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw ForbiddenException if token is from tenant HRMS (missing isPlatform: true)', async () => {
    const context = createMockContext('Bearer tenant_jwt_token');
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'emp-123',
      companyId: 'company-abc',
      role: 'SUPER_ADMIN', // Company admin, not SaaS platform admin
      isPlatform: false,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow access if token has isPlatform: true and active PlatformUser', async () => {
    const context = createMockContext('Bearer platform_jwt_token');
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'platform-user-1',
      role: 'SUPER_ADMIN',
      isPlatform: true,
    });
    prismaService.platformUser.findUnique.mockResolvedValue({
      id: 'platform-user-1',
      email: 'superadmin@globizhr.com',
      role: 'SUPER_ADMIN',
      isActive: true,
    });

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
    const req = context.switchToHttp().getRequest();
    expect(req.platformUser.id).toBe('platform-user-1');
  });
});
