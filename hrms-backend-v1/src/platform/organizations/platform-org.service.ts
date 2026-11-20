import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationStatusDto } from './dto/update-organization-status.dto';
import { CreateAccessSessionDto } from './dto/create-access-session.dto';

@Injectable()
export class PlatformOrgService {
  private readonly logger = new Logger(PlatformOrgService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Paginated tenant listing with multi-attribute filtering & sorting
   */
  async findAll(query: OrganizationQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status === 'ACTIVE' ? 'VERIFIED' : query.status;
    }

    if (query.subscription && query.subscription !== 'ALL') {
      where.subscription = query.subscription;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    const validSortFields = ['createdAt', 'name', 'status', 'subscription'];
    const sortField = validSortFields.includes(query.sortBy || '')
      ? query.sortBy
      : 'createdAt';
    orderBy[sortField!] = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, companies] = await Promise.all([
      this.prisma.company.count({ where }),
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          slug: true,
          status: true,
          subscription: true,
          industry: true,
          size: true,
          city: true,
          country: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              employees: true,
              attendances: true,
              supportTickets: true,
            },
          },
          subscriptions: {
            where: { status: 'ACTIVE' },
            take: 1,
            select: {
              id: true,
              status: true,
              billingCycle: true,
              currentPeriodEnd: true,
              plan: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  monthlyPrice: true,
                  maxEmployees: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: companies.map((c) => ({
        ...c,
        employeeCount: c._count.employees,
        activePlan: c.subscriptions[0]?.plan?.name || c.subscription,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 9-Tab comprehensive tenant inspector
   */
  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        settings: true,
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { payments: true },
        },
        featureOverrides: true,
        supportTickets: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            employees: true,
            departments: true,
            roles: true,
            branches: true,
            attendances: true,
            leaveRequests: true,
            tasks: true,
            supportTickets: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Organization with ID "${id}" was not found`);
    }

    // Load key administrative contacts (omits bank / salary confidential data)
    const keyEmployees = await this.prisma.employee.findMany({
      where: {
        companyId: id,
        role: { in: ['SUPER_ADMIN', 'OWNER', 'HR_HEAD', 'MANAGER'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        employmentStatus: true,
        createdAt: true,
      },
      take: 15,
      orderBy: { createdAt: 'asc' },
    });

    // Load recent platform audit logs for this organization
    const platformAuditHistory = await this.prisma.platformAuditLog.findMany({
      where: { companyId: id },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    // Load recent internal tenant audit logs
    const tenantAuditHistory = await this.prisma.auditLog.findMany({
      where: { companyId: id },
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        actor: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return {
      // 1. Overview
      overview: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        status: company.status,
        subscriptionTier: company.subscription,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        employeeCount: company._count.employees,
        departmentCount: company._count.departments,
        branchCount: company._count.branches,
        attendanceRecordsCount: company._count.attendances,
        leaveRequestsCount: company._count.leaveRequests,
        openTicketsCount: company._count.supportTickets,
      },

      // 2. Company Information
      companyInfo: {
        legalName: company.name,
        officialEmail: company.email,
        phone: company.phone,
        website: company.website,
        industry: company.industry,
        size: company.size,
        address: company.address,
        city: company.city,
        state: company.state,
        country: company.country,
        pincode: company.pincode,
        gstin: company.gstin,
        pan: company.pan,
        cin: company.cin,
      },

      // 3. Subscription Details
      subscription: {
        currentPlan: company.subscriptions[0]?.plan || {
          name: company.subscription,
          code: `PLAN_${company.subscription}`,
        },
        activeSubscription: company.subscriptions[0] || null,
        history: company.subscriptions,
      },

      // 4. Employees & Key Contacts
      employees: {
        totalCount: company._count.employees,
        keyStaff: keyEmployees,
      },

      // 5. Usage & Storage Metrics
      usage: {
        totalEmployees: company._count.employees,
        maxPlanEmployees: company.subscriptions[0]?.plan?.maxEmployees || 25,
        totalAttendances: company._count.attendances,
        totalTasks: company._count.tasks,
        estimatedStorageMb: (
          company._count.attendances * 0.002 +
          company._count.employees * 0.5
        ).toFixed(2),
      },

      // 6. Activity & Audit History
      activityHistory: {
        platformEvents: platformAuditHistory,
        tenantEvents: tenantAuditHistory,
      },

      // 7. Billing History
      billingHistory: {
        invoices: company.invoices,
      },

      // 8. Security & System Configuration
      security: {
        settings: company.settings,
        overrides: company.featureOverrides,
      },

      // 9. Customer Support
      support: {
        tickets: company.supportTickets,
      },
    };
  }

  /**
   * Manual Organization Onboarding by Platform Super Admin
   */
  async create(
    dto: CreateOrganizationDto,
    actorId?: string,
    actorEmail?: string,
  ) {
    const email = dto.email.trim().toLowerCase();
    const adminEmail = dto.adminEmail.trim().toLowerCase();

    // Verify company email and admin email uniqueness
    const [existingCompany, existingEmployee] = await Promise.all([
      this.prisma.company.findUnique({ where: { email } }),
      this.prisma.employee.findUnique({ where: { email: adminEmail } }),
    ]);

    if (existingCompany) {
      throw new ConflictException(
        `An organization with email "${email}" already exists`,
      );
    }
    if (existingEmployee) {
      throw new ConflictException(
        `An employee/admin with email "${adminEmail}" already exists`,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
    const slug =
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 6);

    // Auto-generate employee code
    const empCode = `${
      dto.name
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase() || 'EMP'
    }-001`;

    const result = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: dto.name.trim(),
          email,
          phone: dto.phone,
          industry: dto.industry || 'Technology',
          size: dto.size || '1-50',
          website: dto.website,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          country: dto.country || 'India',
          gstin: dto.gstin,
          pan: dto.pan,
          slug,
          status: 'VERIFIED',
          subscription: 'FREE_TRIAL',
          employees: {
            create: {
              firstName: dto.adminFirstName.trim(),
              lastName: dto.adminLastName.trim(),
              email: adminEmail,
              password: hashedPassword,
              role: 'SUPER_ADMIN',
              employeeCode: empCode,
              employmentStatus: 'ACTIVE',
            },
          },
          settings: {
            create: {
              companyName: dto.name.trim(),
              industry: dto.industry || 'Technology',
              website: dto.website,
              officialEmail: email,
              officialPhone: dto.phone,
              timeZone: 'Asia/Kolkata',
              workingDays: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
              ],
              attendanceMethod: 'GPS_OR_WIFI',
              enableGps: true,
            },
          },
          departments: {
            create: [
              { name: 'Executive' },
              { name: 'Operations' },
              { name: 'Engineering' },
            ],
          },
          roles: {
            create: [
              { name: 'Director' },
              { name: 'Lead' },
              { name: 'Associate' },
            ],
          },
          shifts: {
            create: [
              {
                name: 'Standard General Shift',
                startTime: '09:00',
                endTime: '18:00',
              },
            ],
          },
        },
        include: {
          employees: true,
        },
      });

      // Assign initial subscription if a plan exists
      const defaultPlan = await tx.platformPlan.findFirst({
        where: { isPublic: true },
        orderBy: { monthlyPrice: 'asc' },
      });

      if (defaultPlan) {
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + (defaultPlan.trialDays || 14));

        await tx.subscription.create({
          data: {
            companyId: company.id,
            planId: defaultPlan.id,
            status: 'TRIAL',
            currentPeriodEnd: periodEnd,
            trialEndsAt: periodEnd,
          },
        });
      }

      return company;
    });

    // Record audit log
    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action: 'ORG_CREATE',
            targetEntity: 'Company',
            targetId: result.id,
            companyId: result.id,
            afterState: {
              id: result.id,
              name: result.name,
              email: result.email,
            } as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log organization creation audit', err),
        );
    }

    return result;
  }

  /**
   * Update Organization Status (Approve, Suspend, Reactivate)
   */
  async updateStatus(
    id: string,
    dto: UpdateOrganizationStatusDto,
    actorId?: string,
    actorEmail?: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true, status: true, email: true },
    });

    if (!company) {
      throw new NotFoundException(`Organization "${id}" not found`);
    }

    const previousStatus = company.status;
    const targetStatus = dto.status === 'ACTIVE' ? 'VERIFIED' : dto.status;
    const updated = await this.prisma.company.update({
      where: { id },
      data: { status: targetStatus as any },
    });

    // Audit Logging
    const action =
      targetStatus === 'SUSPENDED'
        ? 'ORG_SUSPEND'
        : targetStatus === 'VERIFIED'
          ? 'ORG_ACTIVATE'
          : 'ORG_STATUS_UPDATE';

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action,
            targetEntity: 'Company',
            targetId: id,
            companyId: id,
            beforeState: { status: previousStatus } as any,
            afterState: { status: dto.status, reason: dto.reason } as any,
            reason: dto.reason || null,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log org status update audit', err),
        );
    }

    return updated;
  }

  /**
   * Controlled Diagnostic Support Access Session
   * Generates a time-bound, auditable token allowing a Platform Super Admin to inspect a tenant
   */
  async createAccessSession(
    id: string,
    dto: CreateAccessSessionDto,
    actorId: string,
    actorEmail: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true, status: true },
    });

    if (!company) {
      throw new NotFoundException(`Organization "${id}" not found`);
    }

    const duration = dto.durationMinutes || 60;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    // Controlled Diagnostic JWT: scoped strictly to this company with explicit support flags
    const payload = {
      sub: actorId,
      email: actorEmail,
      companyId: company.id,
      role: 'SUPER_ADMIN', // grants tenant inspection capabilities
      isSupportDiagnosticSession: true,
      diagnosticReason: dto.reason,
      exp: Math.floor(expiresAt.getTime() / 1000),
    };

    const diagnosticToken = await this.jwtService.signAsync(payload);

    // Mandatory Audit Record for Privileged Tenant Access
    await this.prisma.platformAuditLog.create({
      data: {
        actorId,
        actorEmail,
        actorRole: 'SUPER_ADMIN',
        action: 'SUPPORT_SESSION_START',
        targetEntity: 'Company',
        targetId: company.id,
        companyId: company.id,
        reason: dto.reason,
        beforeState: {
          durationMinutes: duration,
          expiresAt: expiresAt.toISOString(),
        } as any,
        ipAddress,
        userAgent,
      },
    });

    this.logger.warn(
      `Support Diagnostic Session initiated by ${actorEmail} for Organization "${company.name}" (${company.id}). Reason: ${dto.reason}`,
    );

    return {
      companyId: company.id,
      companyName: company.name,
      diagnosticToken,
      expiresAt,
      durationMinutes: duration,
      targetWorkspaceUrl: `/workspace/dashboard?diagnostic_session=true`,
    };
  }
}
