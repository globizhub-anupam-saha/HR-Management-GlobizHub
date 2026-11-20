import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    employee: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    platformUser: {
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
    company: {
      create: jest.fn(),
    },
    emailOtp: {
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const jwt = {
    signAsync: jest.fn(),
  };
  const emailService = {
    sendPasswordResetEmail: jest.fn(),
    sendRegistrationOtpEmail: jest.fn().mockResolvedValue({}),
  };
  const auditService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: jwt,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
        {
          provide: AuditService,
          useValue: auditService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('logs in with an email that differs only by casing or surrounding whitespace', async () => {
    const password = 'correct-horse-battery-staple';
    prisma.employee.findUnique.mockResolvedValue({
      id: 'employee-1',
      email: 'alex@acme.com',
      password: await bcrypt.hash(password, 10),
      companyId: 'company-1',
    });
    jwt.signAsync.mockResolvedValue('token');

    await expect(service.login('  Alex@Acme.COM  ', password)).resolves.toEqual(
      expect.objectContaining({ access_token: 'token', portal: 'WORKSPACE' }),
    );

    expect(prisma.employee.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'alex@acme.com' },
      }),
    );
  });

  it('blocks login if user account has a pending invitation token', async () => {
    const password = 'correct-horse-battery-staple';
    prisma.employee.findUnique.mockResolvedValue({
      id: 'employee-1',
      email: 'alex@acme.com',
      password: await bcrypt.hash(password, 10),
      companyId: 'company-1',
      inviteToken: 'pending-token-hash-123',
    });

    await expect(service.login('alex@acme.com', password)).rejects.toThrow(
      'Your account is pending activation. Please set your password using the invitation link sent to your email.',
    );
  });

  it('unifies login for Platform Super Admin and routes to PLATFORM_ADMIN', async () => {
    const password = 'SuperAdminPassword123!';
    prisma.platformUser.findUnique.mockResolvedValue({
      id: 'platform-user-1',
      email: 'superadmin@globizhr.com',
      password: await bcrypt.hash(password, 10),
      role: 'SUPER_ADMIN',
      isActive: true,
    });
    jwt.signAsync.mockResolvedValue('platform-token');

    const result = await service.login('superadmin@globizhr.com', password);

    expect(result.portal).toBe('PLATFORM_ADMIN');
    expect(result.targetUrl).toBe('/platform-admin/dashboard');
    expect(result.access_token).toBe('platform-token');
    expect(result.user.role).toBe('SUPER_ADMIN');
  });

  describe('forgotPassword', () => {
    it('normalizes the email, sets tokens in DB, and sends reset email', async () => {
      const email = '  Alex@Acme.COM  ';
      const normalizedEmail = 'alex@acme.com';

      prisma.employee.findUnique.mockResolvedValue({
        id: 'employee-1',
        email: normalizedEmail,
      });

      prisma.employee.update.mockResolvedValue({});
      emailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      await expect(service.forgotPassword(email)).resolves.toEqual({
        message: 'If that email exists, a reset link has been sent.',
      });

      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { email: normalizedEmail },
      });

      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: 'employee-1' },
        data: {
          resetPasswordToken: expect.any(String),
          resetPasswordExpires: expect.any(Date),
        },
      });

      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        normalizedEmail,
        expect.stringContaining('/reset-password?token='),
      );
    });

    it('throws BadRequestException if email is invalid', async () => {
      await expect(service.forgotPassword('')).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('successfully resets password with valid token and hashes new password', async () => {
      const token = 'valid-test-token';
      const newPassword = 'NewSecurePassword123!';

      prisma.employee.findFirst.mockResolvedValue({
        id: 'employee-1',
        companyId: 'company-1',
      });
      prisma.employee.update.mockResolvedValue({});
      auditService.logAction.mockResolvedValue({});

      const result = await service.resetPassword(token, newPassword);

      expect(result).toEqual({
        message: 'Password has been reset successfully',
      });
      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: 'employee-1' },
        data: {
          password: expect.any(String),
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        'company-1',
        'employee-1',
        'UPDATE',
        'Employee',
        'employee-1',
        null,
        { field: 'password', reason: 'PASSWORD_RESET' },
      );
    });

    it('throws BadRequestException if token is invalid or expired', async () => {
      prisma.employee.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid-token', 'NewSecurePassword123!'),
      ).rejects.toThrow('Token is invalid or has expired');
    });

    it('throws BadRequestException if password is too short', async () => {
      await expect(
        service.resetPassword('valid-token', 'short'),
      ).rejects.toThrow('Password must be at least 8 characters long');
    });
  });

  describe('sendRegistrationOtp', () => {
    it('generates, hashes, stores OTP and sends email', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      prisma.emailOtp.findFirst.mockResolvedValue(null);
      prisma.emailOtp.deleteMany.mockResolvedValue({});
      prisma.emailOtp.create.mockResolvedValue({});

      const result = await service.sendRegistrationOtp('newuser@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Verification code sent');
      expect(prisma.emailOtp.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'newuser@example.com',
          otpHash: expect.any(String),
          verified: false,
        }),
      });
      expect(emailService.sendRegistrationOtpEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        expect.stringMatching(/^\d{6}$/),
      );
    });

    it('throws ConflictException if email is already registered', async () => {
      prisma.employee.findUnique.mockResolvedValue({ id: 'emp-1' });

      await expect(
        service.sendRegistrationOtp('existing@example.com'),
      ).rejects.toThrow('An account already exists with this email address');
    });

    it('throttles if OTP was requested less than 45s ago', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      prisma.emailOtp.findFirst.mockResolvedValue({
        id: 'otp-1',
        createdAt: new Date(Date.now() - 10 * 1000), // 10s ago
      });

      await expect(
        service.sendRegistrationOtp('newuser@example.com'),
      ).rejects.toThrow('Please wait');
    });
  });

  describe('verifyRegistrationOtp', () => {
    it('verifies valid OTP successfully', async () => {
      // import handled at top
      const testOtp = '123456';
      const otpHash = crypto.createHash('sha256').update(testOtp).digest('hex');

      prisma.emailOtp.findFirst.mockResolvedValue({
        id: 'otp-1',
        email: 'user@example.com',
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      });
      prisma.emailOtp.update.mockResolvedValue({});

      const res = await service.verifyRegistrationOtp(
        'user@example.com',
        testOtp,
      );

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(prisma.emailOtp.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: { verified: true },
      });
    });

    it('rejects incorrect OTP and increments attempt count', async () => {
      // import handled at top
      const testOtp = '123456';
      const otpHash = crypto.createHash('sha256').update(testOtp).digest('hex');

      prisma.emailOtp.findFirst.mockResolvedValue({
        id: 'otp-1',
        email: 'user@example.com',
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      });
      prisma.emailOtp.update.mockResolvedValue({});

      await expect(
        service.verifyRegistrationOtp('user@example.com', '999999'),
      ).rejects.toThrow('Incorrect verification code');

      expect(prisma.emailOtp.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: { attempts: { increment: 1 } },
      });
    });

    it('rejects expired OTP', async () => {
      prisma.emailOtp.findFirst.mockResolvedValue({
        id: 'otp-1',
        email: 'user@example.com',
        otpHash: 'somehash',
        expiresAt: new Date(Date.now() - 1000),
        attempts: 0,
      });

      await expect(
        service.verifyRegistrationOtp('user@example.com', '123456'),
      ).rejects.toThrow('Verification code has expired');
    });
  });
});
