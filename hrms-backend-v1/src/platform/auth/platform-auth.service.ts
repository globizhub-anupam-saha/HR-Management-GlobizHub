import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PlatformLoginDto } from './dto/platform-login.dto';
import { PlatformRegisterDto } from './dto/platform-register.dto';
import { PlatformRoleType } from '../../../generated/prisma/enums';

@Injectable()
export class PlatformAuthService {
  private readonly logger = new Logger(PlatformAuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedInitialSuperAdmin();
  }

  /**
   * Automatically ensure at least one Platform Super Admin exists
   */
  async seedInitialSuperAdmin() {
    try {
      const superAdminCount = await this.prisma.platformUser.count({
        where: { role: 'SUPER_ADMIN' },
      });

      if (superAdminCount === 0) {
        const defaultEmail =
          process.env.PLATFORM_ADMIN_EMAIL || 'superadmin@globizhr.com';
        const defaultPassword =
          process.env.PLATFORM_ADMIN_PASSWORD || 'SuperAdmin@GlobizHR2026!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await this.prisma.platformUser.create({
          data: {
            email: defaultEmail.toLowerCase().trim(),
            firstName: 'Platform',
            lastName: 'Super Admin',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true,
          },
        });

        this.logger.log(
          `Initialized default Platform Super Admin: ${defaultEmail}`,
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `Could not verify/seed initial Super Admin: ${err.message}`,
      );
    }
  }

  async login(dto: PlatformLoginDto, ipAddress?: string, userAgent?: string) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.platformUser.findUnique({
      where: { email },
    });

    if (user && user.isActive) {
      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (isMatch) {
        // Update login metrics
        const now = new Date();
        await this.prisma.platformUser.update({
          where: { id: user.id },
          data: {
            lastLoginAt: now,
            lastLoginIp: ipAddress || null,
          },
        });

        // Record audit event asynchronously
        this.prisma.platformAuditLog
          .create({
            data: {
              actorId: user.id,
              actorEmail: user.email,
              actorRole: user.role,
              action: 'LOGIN',
              targetEntity: 'PlatformUser',
              targetId: user.id,
              ipAddress,
              userAgent,
            },
          })
          .catch((err) =>
            this.logger.error('Failed to log platform login audit', err),
          );

        const payload = {
          sub: user.id,
          email: user.email,
          role: user.role,
          isPlatform: true, // Discriminator for platform-level RBAC
        };

        return {
          access_token: await this.jwtService.signAsync(payload, {
            expiresIn: '8h',
          }),
          portal: 'PLATFORM_ADMIN',
          targetUrl: '/platform-admin/dashboard',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isPlatform: true,
          },
        };
      }
    }

    // 2. Graceful Fallback: Check if credentials belong to a Tenant / Company Employee
    if (this.prisma.employee) {
      try {
        const employee = await this.prisma.employee.findUnique({
          where: { email },
          include: {
            company: {
              select: { id: true, name: true, status: true },
            },
          },
        });

        if (employee) {
          const isEmployeeMatch = await bcrypt.compare(
            dto.password,
            employee.password,
          );
          if (isEmployeeMatch) {
            if (employee.company?.status === 'SUSPENDED') {
              throw new UnauthorizedException(
                'Your organization account has been suspended.',
              );
            }
            if (employee.company?.status === 'PENDING_VERIFICATION') {
              throw new UnauthorizedException(
                'Your organization is awaiting platform approval.',
              );
            }

            const employeePayload = {
              sub: employee.id,
              email: employee.email,
              companyId: employee.companyId,
              role: employee.role,
            };

            return {
              access_token: await this.jwtService.signAsync(employeePayload),
              portal: 'WORKSPACE',
              targetUrl: '/workspace/dashboard',
              user: {
                id: employee.id,
                email: employee.email,
                firstName: employee.firstName,
                lastName: employee.lastName,
                role: employee.role,
                companyId: employee.companyId,
              },
            };
          }
        }
      } catch (err: any) {
        if (err instanceof UnauthorizedException) throw err;
      }
    }

    throw new UnauthorizedException('Invalid platform credentials');
  }

  async register(
    dto: PlatformRegisterDto,
    actorId?: string,
    actorEmail?: string,
  ) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.platformUser.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException(
        'A platform user with this email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.prisma.platformUser.create({
      data: {
        email,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        password: hashedPassword,
        role: dto.role || 'PLATFORM_ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action: 'ADMIN_CREATE',
            targetEntity: 'PlatformUser',
            targetId: newUser.id,
            afterState: newUser as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log admin creation audit', err),
        );
    }

    return newUser;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.platformUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        mfaEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Platform user not found');
    return user;
  }
}
