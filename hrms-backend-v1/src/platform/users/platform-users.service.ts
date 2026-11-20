import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { PlatformRoleType } from '../../../generated/prisma/enums';

export const PLATFORM_ROLES_PERMISSIONS = {
  SUPER_ADMIN: {
    name: 'Super Administrator',
    description:
      'Unrestricted control over organizations, subscriptions, platform staff, infrastructure and billing.',
    permissions: [
      'all:read',
      'all:write',
      'org:manage',
      'billing:manage',
      'plans:manage',
      'users:manage',
      'support:manage',
      'security:audit',
    ],
  },
  PLATFORM_ADMIN: {
    name: 'Platform Administrator',
    description:
      'Manages organizations, features, modules and general system operations.',
    permissions: [
      'org:manage',
      'modules:manage',
      'support:manage',
      'analytics:read',
      'security:audit',
    ],
  },
  BILLING_ADMIN: {
    name: 'Billing Administrator',
    description:
      'Manages subscriptions, pricing plans, invoices, payments and dunning recovery.',
    permissions: [
      'billing:manage',
      'plans:manage',
      'invoices:manage',
      'payments:manage',
      'analytics:read',
    ],
  },
  SUPPORT_ADMIN: {
    name: 'Support Operations',
    description:
      'Assists customers, manages support tickets, and initiates controlled diagnostic sessions.',
    permissions: [
      'support:manage',
      'org:read',
      'diagnostic:execute',
      'analytics:read',
    ],
  },
  PLATFORM_ANALYST: {
    name: 'Platform Analyst',
    description:
      'Read-only access to business intelligence, revenue metrics and executive SaaS dashboards.',
    permissions: ['analytics:read', 'dashboard:read', 'reports:export'],
  },
};

@Injectable()
export class PlatformUsersService {
  private readonly logger = new Logger(PlatformUsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * List all platform staff with pagination and search
   */
  async findAll(query: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role && query.role !== 'ALL') {
      where.role = query.role as PlatformRoleType;
    }
    if (query.search) {
      where.OR = [
        { email: { contains: query.search.trim(), mode: 'insensitive' } },
        { firstName: { contains: query.search.trim(), mode: 'insensitive' } },
        { lastName: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.platformUser.count({ where }),
      this.prisma.platformUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create / Invite a new platform administrator
   */
  async create(
    dto: CreatePlatformUserDto,
    actorId?: string,
    actorEmail?: string,
  ) {
    const existing = await this.prisma.platformUser.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException(
        'Platform user with this email already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.platformUser.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
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
            action: 'PLATFORM_USER_CREATE',
            targetEntity: 'PlatformUser',
            targetId: user.id,
            afterState: { email: user.email, role: user.role } as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log platform user creation audit', err),
        );
    }

    return user;
  }

  /**
   * Update role of a platform administrator
   */
  async updateRole(
    id: string,
    role: PlatformRoleType,
    actorId?: string,
    actorEmail?: string,
  ) {
    const user = await this.prisma.platformUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Platform user not found');

    const updated = await this.prisma.platformUser.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action: 'PLATFORM_USER_ROLE_UPDATE',
            targetEntity: 'PlatformUser',
            targetId: id,
            beforeState: { role: user.role } as any,
            afterState: { role: updated.role } as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log role update audit', err),
        );
    }

    return updated;
  }

  /**
   * Toggle activation state of platform administrator
   */
  async toggleActive(
    id: string,
    isActive: boolean,
    actorId?: string,
    actorEmail?: string,
  ) {
    const user = await this.prisma.platformUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Platform user not found');

    const updated = await this.prisma.platformUser.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action: 'PLATFORM_USER_STATUS_TOGGLE',
            targetEntity: 'PlatformUser',
            targetId: id,
            beforeState: { isActive: user.isActive } as any,
            afterState: { isActive: updated.isActive } as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log user status toggle audit', err),
        );
    }

    return updated;
  }

  /**
   * Reset / update password of a platform administrator
   */
  async updatePassword(
    id: string,
    newPassword: string,
    actorId?: string,
    actorEmail?: string,
  ) {
    if (!newPassword || newPassword.length < 8) {
      throw new ConflictException(
        'Password must be at least 8 characters long',
      );
    }
    const user = await this.prisma.platformUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Platform user not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.platformUser.update({
      where: { id },
      data: { password: hashedPassword },
    });

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action: 'PLATFORM_USER_PASSWORD_UPDATE',
            targetEntity: 'PlatformUser',
            targetId: id,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log password update audit', err),
        );
    }

    return { message: 'Password updated successfully' };
  }

  /**
   * Update profile/email of a platform administrator
   */
  async updateProfile(
    id: string,
    dto: { email?: string; firstName?: string; lastName?: string },
    actorId?: string,
    actorEmail?: string,
  ) {
    const user = await this.prisma.platformUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Platform user not found');

    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const existing = await this.prisma.platformUser.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (existing) {
        throw new ConflictException(
          'Email already in use by another platform user',
        );
      }
    }

    const updated = await this.prisma.platformUser.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email.toLowerCase().trim() }),
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action: 'PLATFORM_USER_PROFILE_UPDATE',
            targetEntity: 'PlatformUser',
            targetId: id,
            beforeState: {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            } as any,
            afterState: {
              email: updated.email,
              firstName: updated.firstName,
              lastName: updated.lastName,
            } as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log profile update audit', err),
        );
    }

    return updated;
  }

  /**
   * Get roles permissions matrix
   */
  getRolesMatrix() {
    return PLATFORM_ROLES_PERMISSIONS;
  }
}
