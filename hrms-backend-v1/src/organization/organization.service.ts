import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { UpdateDesignationPermissionsDto } from './dto/update-designation-permissions.dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // BRANCHES
  // ==========================================

  async getBranches(companyId: string) {
    return this.prisma.branch.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createBranch(companyId: string, name: string, address?: string) {
    return this.prisma.branch.create({
      data: {
        companyId,
        name,
        address,
      },
    });
  }

  async deleteBranch(companyId: string, branchId: string) {
    // Verify it belongs to the company before deleting
    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, companyId },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    const departmentCount = await this.prisma.department.count({
      where: { branchId },
    });
    if (departmentCount > 0) {
      throw new BadRequestException(
        `Cannot delete branch because it is assigned to ${departmentCount} department(s). Please reassign or remove them first.`,
      );
    }

    return this.prisma.branch.delete({ where: { id: branchId } });
  }

  // ==========================================
  // DEPARTMENTS
  // ==========================================

  async getDepartments(companyId: string) {
    return this.prisma.department.findMany({
      where: { companyId },
      include: { branch: true }, // Include branch details if assigned
      orderBy: { createdAt: 'asc' },
    });
  }

  async createDepartment(companyId: string, name: string, branchId?: string) {
    return this.prisma.department.create({
      data: {
        companyId,
        name,
        branchId,
      },
    });
  }

  async deleteDepartment(companyId: string, departmentId: string) {
    const dept = await this.prisma.department.findFirst({
      where: { id: departmentId, companyId },
    });
    if (!dept) throw new NotFoundException('Department not found');

    const employeeCount = await this.prisma.employee.count({
      where: { departmentId },
    });
    if (employeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete department because it is assigned to ${employeeCount} employee(s). Please reassign them first.`,
      );
    }

    const requisitionCount = await this.prisma.jobRequisition.count({
      where: { departmentId, status: { notIn: ['CLOSED', 'CANCELLED'] } },
    });
    if (requisitionCount > 0) {
      throw new BadRequestException(
        `Cannot delete department because it is linked to ${requisitionCount} active job requisition(s).`,
      );
    }

    const roleCount = await this.prisma.role.count({
      where: { departmentId },
    });
    if (roleCount > 0) {
      throw new BadRequestException(
        `Cannot delete department because it is assigned to ${roleCount} role(s). Please remove or reassign them first.`,
      );
    }

    return this.prisma.department.delete({ where: { id: departmentId } });
  }

  // ==========================================
  // ROLES
  // ==========================================

  async getRoles(companyId: string) {
    return this.prisma.role.findMany({
      where: { companyId },
      include: { department: true }, // Include department details if assigned
      orderBy: { createdAt: 'asc' },
    });
  }

  async createRole(companyId: string, name: string, departmentId?: string) {
    return this.prisma.role.create({
      data: {
        companyId,
        name,
        departmentId,
      },
    });
  }

  async deleteRole(companyId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, companyId },
    });
    if (!role) throw new NotFoundException('Role not found');

    const employeeCount = await this.prisma.employee.count({
      where: { roleId },
    });
    if (employeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete role because it is assigned to ${employeeCount} employee(s). Please reassign them first.`,
      );
    }

    return this.prisma.role.delete({ where: { id: roleId } });
  }

  // ==========================================
  // DESIGNATIONS & PERMISSIONS
  // ==========================================

  async getDesignations(companyId: string) {
    let designations = await this.prisma.designation.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Workspaces created before Designation was introduced stored the job
    // titles selected during setup as legacy roles. Promote those titles the
    // first time they are requested so recruitment forms have valid IDs to use.
    if (designations.length === 0) {
      const legacyRoles = await this.prisma.role.findMany({
        where: { companyId },
        select: { name: true },
      });

      if (legacyRoles.length > 0) {
        await this.prisma.designation.createMany({
          data: legacyRoles.map((role) => ({
            companyId,
            name: role.name,
            baseRole: 'EMPLOYEE',
          })),
          skipDuplicates: true,
        });

        designations = await this.prisma.designation.findMany({
          where: { companyId },
          include: {
            _count: {
              select: { employees: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        });
      }
    }

    return designations.map((d) => ({
      ...d,
      employeeCount: d._count.employees,
    }));
  }

  async getDesignationById(companyId: string, id: string) {
    const designation: any = await this.prisma.designation.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            employees: true,
            jobRequisitions: true,
            manpowerRequisitions: true,
          },
        },
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    return {
      ...designation,
      employeeCount: designation._count?.employees ?? 0,
      jobRequisitionsCount: designation._count?.jobRequisitions ?? 0,
      manpowerRequisitionsCount: designation._count?.manpowerRequisitions ?? 0,
    };
  }

  async createDesignation(companyId: string, dto: CreateDesignationDto) {
    return this.prisma.designation.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        baseRole: dto.baseRole,
        color: dto.color || '#6366F1',
        sidebarModules: dto.sidebarModules || [],
        modulePermissions: dto.modulePermissions || {},
        dashboardWidgets: dto.dashboardWidgets || [],
      },
    });
  }

  async updateDesignation(
    companyId: string,
    id: string,
    dto: UpdateDesignationDto,
  ) {
    const designation = await this.prisma.designation.findFirst({
      where: { id, companyId },
    });
    if (!designation) throw new NotFoundException('Designation not found');

    return this.prisma.designation.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.baseRole !== undefined && { baseRole: dto.baseRole }),
      },
    });
  }

  async updateDesignationPermissions(
    companyId: string,
    id: string,
    dto: UpdateDesignationPermissionsDto,
  ) {
    const designation = await this.prisma.designation.findFirst({
      where: { id, companyId },
    });
    if (!designation) throw new NotFoundException('Designation not found');

    return this.prisma.designation.update({
      where: { id },
      data: {
        sidebarModules: dto.sidebarModules ?? [],
        modulePermissions: dto.modulePermissions ?? {},
        dashboardWidgets: dto.dashboardWidgets ?? [],
      },
    });
  }

  async deleteDesignation(companyId: string, id: string) {
    const designation = await this.prisma.designation.findFirst({
      where: { id, companyId },
    });
    if (!designation) throw new NotFoundException('Designation not found');
    if (designation.isDefault) {
      throw new ForbiddenException('Cannot delete default system designation');
    }

    const employeeCount = await this.prisma.employee.count({
      where: { designationId: id },
    });
    if (employeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete designation because it is assigned to ${employeeCount} employee(s). Please reassign them first.`,
      );
    }

    const activeRequisitions = await this.prisma.jobRequisition.count({
      where: { designationId: id, status: { notIn: ['CLOSED', 'CANCELLED'] } },
    });
    if (activeRequisitions > 0) {
      throw new BadRequestException(
        `Cannot delete designation because it is linked to ${activeRequisitions} active job requisition(s).`,
      );
    }

    const activeManpower = await this.prisma.manpowerRequisition.count({
      where: {
        designationId: id,
        status: { notIn: ['REJECTED', 'CANCELLED'] },
      },
    });
    if (activeManpower > 0) {
      throw new BadRequestException(
        `Cannot delete designation because it is linked to ${activeManpower} active manpower requisition(s).`,
      );
    }

    return this.prisma.designation.delete({
      where: { id },
    });
  }

  /**
   * Get tenant subscription overview, resource usage and available plans
   */
  async getSubscriptionOverview(companyId: string) {
    let subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: {
        plan: {
          include: {
            entitlements: true,
          },
        },
      },
    });

    // If subscription is missing, auto-create Free Trial fallback
    if (!subscription) {
      const trialPlan = await this.prisma.platformPlan.findFirst({
        where: { OR: [{ code: 'PLAN_FREE' }, { name: 'Free Trial' }] },
        include: { entitlements: true },
      });

      if (trialPlan) {
        const now = new Date();
        const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        subscription = await this.prisma.subscription.create({
          data: {
            companyId,
            planId: trialPlan.id,
            billingCycle: 'MONTHLY',
            status: 'TRIAL',
            startDate: now,
            trialEndsAt,
            currentPeriodEnd: trialEndsAt,
          },
          include: {
            plan: {
              include: {
                entitlements: true,
              },
            },
          },
        });
      }
    }

    const [
      activeEmployeesCount,
      totalDocumentsCount,
      availablePlans,
      recentInvoices,
    ] = await Promise.all([
      this.prisma.employee.count({
        where: { companyId, exitRecord: null },
      }),
      this.prisma.document.count({
        where: { companyId },
      }),
      this.prisma.platformPlan.findMany({
        where: { isPublic: true, isActive: true },
        orderBy: { monthlyPrice: 'asc' },
        include: { entitlements: true },
      }),
      this.prisma.invoice.findMany({
        where: { companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const maxEmployees = subscription?.plan?.maxEmployees ?? 25;
    const maxStorageGb = subscription?.plan?.maxStorageGb ?? 5;
    const estimatedStorageGb = Number(
      (totalDocumentsCount * 0.005 + 0.1).toFixed(2),
    );

    const currentPeriodEnd = subscription?.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd)
      : new Date();
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    return {
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            billingCycle: subscription.billingCycle,
            startDate: subscription.startDate,
            currentPeriodEnd: subscription.currentPeriodEnd,
            trialEndsAt: subscription.trialEndsAt,
            daysRemaining,
            plan: {
              id: subscription.plan.id,
              name: subscription.plan.name,
              code: subscription.plan.code,
              description: subscription.plan.description,
              monthlyPrice: Number(subscription.plan.monthlyPrice),
              annualPrice: Number(subscription.plan.annualPrice),
              currency: subscription.plan.currency,
              maxEmployees: subscription.plan.maxEmployees,
              maxStorageGb: subscription.plan.maxStorageGb,
              trialDays: subscription.plan.trialDays,
            },
            entitlements: subscription.plan.entitlements.map((e) => ({
              moduleKey: e.moduleKey,
              isEnabled: e.isEnabled,
            })),
          }
        : null,
      usage: {
        activeEmployees: activeEmployeesCount,
        maxEmployees,
        employeeUsagePct: Math.min(
          100,
          Math.round((activeEmployeesCount / maxEmployees) * 100),
        ),
        storageUsedGb: estimatedStorageGb,
        maxStorageGb,
        storageUsagePct: Math.min(
          100,
          Math.round((estimatedStorageGb / maxStorageGb) * 100),
        ),
      },
      availablePlans: availablePlans.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        description: p.description,
        monthlyPrice: Number(p.monthlyPrice),
        annualPrice: Number(p.annualPrice),
        currency: p.currency,
        maxEmployees: p.maxEmployees,
        maxStorageGb: p.maxStorageGb,
        trialDays: p.trialDays,
        entitlements: p.entitlements.map((e) => ({
          moduleKey: e.moduleKey,
          isEnabled: e.isEnabled,
        })),
      })),
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amountDue: Number(inv.amountDue),
        amountPaid: Number(inv.amountPaid),
        currency: inv.currency,
        status: inv.status,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        createdAt: inv.createdAt,
      })),
    };
  }

  /**
   * Get all invoices for this tenant organization
   */
  async getCompanyInvoices(companyId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        subscription: {
          include: { plan: true },
        },
      },
    });

    return invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amountDue: Number(inv.amountDue),
      amountPaid: Number(inv.amountPaid),
      currency: inv.currency,
      status: inv.status,
      dueDate: inv.dueDate,
      paidAt: inv.paidAt,
      createdAt: inv.createdAt,
      planName: inv.subscription?.plan?.name || 'Subscription Plan',
      payments: inv.payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        currency: p.currency,
        gateway: p.gateway,
        status: p.status,
        createdAt: p.createdAt,
      })),
    }));
  }

  /**
   * Get single invoice detail with full company tax & payment records
   */
  async getCompanyInvoiceById(companyId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            gstin: true,
            pan: true,
            address: true,
            city: true,
            state: true,
            country: true,
            pincode: true,
          },
        },
        subscription: {
          include: {
            plan: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    return {
      ...invoice,
      amountDue: Number(invoice.amountDue),
      amountPaid: Number(invoice.amountPaid),
      payments: invoice.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    };
  }
}
