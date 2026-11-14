import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { AuditService } from '../audit/audit.service';
import { generateDepartmentScopedEmployeeCode } from '../employee/utils/employee-code.util';

const DEFAULT_ONBOARDING_TASKS = [
  {
    title: 'Complete Profile & Contact Details',
    description:
      'Provide your personal phone number, blood group, emergency contacts and address.',
    requiredForActivation: true,
  },
  {
    title: 'Digital Offer Letter Acceptance',
    description:
      'Read, acknowledge, and digitally accept the employment offer terms.',
    requiredForActivation: true,
  },
  {
    title: 'Upload KYC & Identity Documents',
    description:
      'Submit government-issued ID (Aadhaar / National ID / Passport) and PAN card.',
    requiredForActivation: true,
  },
  {
    title: 'Bank & Statutory Details Submission',
    description:
      'Provide bank account, IFSC, and PF/UAN details for automated payroll processing.',
    requiredForActivation: true,
  },
  {
    title: 'Company Policy & Security Orientation',
    description:
      'Review the Employee Handbook, code of conduct, and workplace guidelines.',
    requiredForActivation: false,
  },
  {
    title: 'Workstation & IT Credentials Setup',
    description:
      'Register your primary working device and set up required workspace software.',
    requiredForActivation: false,
  },
];

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ==========================================
  // TEMPLATES MANAGEMENT (HR / Admin)
  // ==========================================

  async createTemplate(
    companyId: string,
    dto: CreateTemplateDto,
    actorId?: string,
  ) {
    const template = await this.prisma.onboardingTemplate.create({
      data: {
        companyId,
        name: dto.name,
        departmentId: dto.departmentId || null,
        roleId: dto.roleId || null,
        taskChecklist: (dto.taskChecklist as any) || [],
        documentChecklist: (dto.documentChecklist as any) || [],
      },
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'CREATE',
      'OnboardingTemplate',
      template.id,
      null,
      { name: template.name },
    );

    return template;
  }

  async getTemplates(companyId: string) {
    return this.prisma.onboardingTemplate.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { cases: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplateById(companyId: string, templateId: string) {
    const template = await this.prisma.onboardingTemplate.findFirst({
      where: { id: templateId, companyId },
      include: {
        cases: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                employeeCode: true,
              },
            },
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Onboarding template not found');
    }

    return template;
  }

  async updateTemplate(
    companyId: string,
    templateId: string,
    dto: UpdateTemplateDto,
    actorId?: string,
  ) {
    const template = await this.prisma.onboardingTemplate.findFirst({
      where: { id: templateId, companyId },
    });

    if (!template) {
      throw new NotFoundException('Onboarding template not found');
    }

    const updated = await this.prisma.onboardingTemplate.update({
      where: { id: templateId },
      data: {
        name: dto.name,
        departmentId: dto.departmentId,
        roleId: dto.roleId,
        taskChecklist: dto.taskChecklist
          ? (dto.taskChecklist as any)
          : undefined,
        documentChecklist: dto.documentChecklist
          ? (dto.documentChecklist as any)
          : undefined,
      },
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'OnboardingTemplate',
      templateId,
      { name: template.name },
      { name: updated.name },
    );

    return updated;
  }

  async deleteTemplate(
    companyId: string,
    templateId: string,
    actorId?: string,
  ) {
    const template = await this.prisma.onboardingTemplate.findFirst({
      where: { id: templateId, companyId },
      include: { _count: { select: { cases: true } } },
    });

    if (!template) {
      throw new NotFoundException('Onboarding template not found');
    }

    if (template._count.cases > 0) {
      throw new BadRequestException(
        `Cannot delete template because it is assigned to ${template._count.cases} active onboarding case(s).`,
      );
    }

    const deleted = await this.prisma.onboardingTemplate.delete({
      where: { id: templateId },
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'DELETE',
      'OnboardingTemplate',
      templateId,
      { name: template.name },
      null,
    );

    return deleted;
  }

  // ==========================================
  // ONBOARDING CASES MANAGEMENT (HR / Admin)
  // ==========================================

  async getAllCases(companyId: string, status?: string) {
    // 1. Auto-backfill: ensure every employee in this workspace has an onboarding case
    try {
      const employeesWithoutCase = await this.prisma.employee.findMany({
        where: {
          companyId,
          onboardingCase: null,
        },
        select: {
          id: true,
          departmentId: true,
          roleId: true,
        },
      });

      for (const emp of employeesWithoutCase) {
        try {
          await this.initializeCaseForEmployee(
            companyId,
            emp.id,
            emp.departmentId || undefined,
            emp.roleId || undefined,
          );
        } catch {
          // ignore individual sync error
        }
      }
    } catch (syncErr) {
      console.error('Failed to auto-sync onboarding cases:', syncErr);
    }

    const whereClause: any = { companyId };
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const cases = await this.prisma.onboardingCase.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            employeeCode: true,
            joiningDate: true,
            employmentStatus: true,
            profilePhoto: true,
            department: { select: { id: true, name: true } },
            designation: { select: { id: true, name: true, color: true } },
          },
        },
        template: {
          select: { id: true, name: true },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            requiredForActivation: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            isSigned: true,
            fileUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return cases.map((c) => {
      const totalTasks = c.tasks.length;
      const completedTasks = c.tasks.filter(
        (t) => t.status === 'COMPLETED',
      ).length;
      const progressPercent =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...c,
        metrics: {
          totalTasks,
          completedTasks,
          progressPercent,
          totalDocuments: c.documents.length,
          verifiedDocuments: c.documents.filter((d) => d.status === 'VERIFIED')
            .length,
        },
      };
    });
  }

  async getCaseById(companyId: string, caseId: string) {
    const onboardingCase = await this.prisma.onboardingCase.findFirst({
      where: { id: caseId, companyId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            employeeCode: true,
            joiningDate: true,
            employmentStatus: true,
            profilePhoto: true,
            bloodGroup: true,
            gender: true,
            department: { select: { id: true, name: true } },
            designation: { select: { id: true, name: true, color: true } },
            emergencyContacts: true,
            skills: true,
          },
        },
        template: true,
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!onboardingCase) {
      throw new NotFoundException('Onboarding case not found');
    }

    const totalTasks = onboardingCase.tasks.length;
    const completedTasks = onboardingCase.tasks.filter(
      (t) => t.status === 'COMPLETED',
    ).length;

    return {
      ...onboardingCase,
      metrics: {
        totalTasks,
        completedTasks,
        progressPercent:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalDocuments: onboardingCase.documents.length,
        verifiedDocuments: onboardingCase.documents.filter(
          (d) => d.status === 'VERIFIED',
        ).length,
      },
    };
  }

  async updateCaseStatus(
    companyId: string,
    caseId: string,
    dto: UpdateCaseStatusDto,
    actorId?: string,
  ) {
    const existing = await this.prisma.onboardingCase.findFirst({
      where: { id: caseId, companyId },
      include: { employee: true },
    });

    if (!existing) {
      throw new NotFoundException('Onboarding case not found');
    }

    const updated = await this.prisma.onboardingCase.update({
      where: { id: caseId },
      data: {
        ...(dto.status && { status: dto.status as any }),
        ...(dto.offerSigned !== undefined && { offerSigned: dto.offerSigned }),
        ...(dto.bgvStatus && { bgvStatus: dto.bgvStatus }),
      },
      include: { employee: true },
    });

    // If case is marked COMPLETED, generate sequential employeeCode & activate the employee in directory
    if (dto.status === 'COMPLETED') {
      const emp = await this.prisma.employee.findUnique({
        where: { id: existing.employeeId },
        include: { department: true, company: true },
      });

      let generatedEmployeeCode = emp?.employeeCode;

      if (!generatedEmployeeCode && emp) {
        generatedEmployeeCode = await generateDepartmentScopedEmployeeCode({
          prisma: this.prisma,
          companyId,
          departmentId: emp.departmentId,
          excludeEmployeeId: emp.id,
        });
      }

      await this.prisma.employee.update({
        where: { id: existing.employeeId },
        data: {
          employmentStatus: 'ACTIVE',
          ...(generatedEmployeeCode && { employeeCode: generatedEmployeeCode }),
        },
      });
    }

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'OnboardingCase',
      caseId,
      { status: existing.status, bgvStatus: existing.bgvStatus },
      { status: updated.status, bgvStatus: updated.bgvStatus },
    );

    return updated;
  }

  async assignTemplateToEmployee(
    companyId: string,
    caseId: string,
    templateId: string,
    actorId?: string,
  ) {
    const onboardingCase = await this.prisma.onboardingCase.findFirst({
      where: { id: caseId, companyId },
    });

    if (!onboardingCase) {
      throw new NotFoundException('Onboarding case not found');
    }

    const template = await this.prisma.onboardingTemplate.findFirst({
      where: { id: templateId, companyId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Link template to case
    await this.prisma.onboardingCase.update({
      where: { id: caseId },
      data: {
        templateId: template.id,
        status:
          onboardingCase.status === 'INVITED'
            ? 'IN_PROGRESS'
            : onboardingCase.status,
      },
    });

    // Generate tasks from checklist if available
    const taskList = Array.isArray(template.taskChecklist)
      ? (template.taskChecklist as any[])
      : [];

    for (const task of taskList) {
      await this.prisma.task.create({
        data: {
          companyId,
          employeeId: onboardingCase.employeeId,
          onboardingCaseId: onboardingCase.id,
          title: task.title,
          description: task.description || null,
          source: 'TEMPLATE',
          requiredForActivation: task.requiredForActivation ?? false,
          status: 'PENDING',
        },
      });
    }

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'OnboardingCase',
      caseId,
      null,
      { assignedTemplate: template.name },
    );

    return this.getCaseById(companyId, caseId);
  }

  // ==========================================
  // EMPLOYEE / CANDIDATE SELF-SERVICE
  // ==========================================

  async getMyOnboarding(employeeId: string) {
    let onboardingCase = await this.prisma.onboardingCase.findUnique({
      where: { employeeId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            employeeCode: true,
            joiningDate: true,
            employmentStatus: true,
            profilePhoto: true,
            bloodGroup: true,
            bankName: true,
            accountNumber: true,
            ifscCode: true,
            panNumber: true,
            nationalId: true,
            pfAccountNumber: true,
            uanNumber: true,
            department: { select: { id: true, name: true } },
            designation: { select: { id: true, name: true, color: true } },
            company: { select: { id: true, name: true } },
            emergencyContacts: true,
          },
        },
        template: true,
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // If no case exists yet for this employee, auto-initialize one!
    if (!onboardingCase) {
      const emp = await this.prisma.employee.findUnique({
        where: { id: employeeId },
      });
      if (!emp) throw new NotFoundException('Employee not found');

      await this.initializeCaseForEmployee(
        emp.companyId,
        emp.id,
        emp.departmentId || undefined,
      );

      onboardingCase = await this.prisma.onboardingCase.findUnique({
        where: { employeeId },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              employeeCode: true,
              joiningDate: true,
              employmentStatus: true,
              profilePhoto: true,
              bloodGroup: true,
              bankName: true,
              accountNumber: true,
              ifscCode: true,
              panNumber: true,
              nationalId: true,
              pfAccountNumber: true,
              uanNumber: true,
              department: { select: { id: true, name: true } },
              designation: { select: { id: true, name: true, color: true } },
              company: { select: { id: true, name: true } },
              emergencyContacts: true,
            },
          },
          template: true,
          tasks: {
            orderBy: { createdAt: 'asc' },
          },
          documents: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (!onboardingCase) {
      throw new NotFoundException('Onboarding case could not be loaded');
    }

    const totalTasks = onboardingCase.tasks.length;
    const completedTasks = onboardingCase.tasks.filter(
      (t) => t.status === 'COMPLETED',
    ).length;

    return {
      ...onboardingCase,
      metrics: {
        totalTasks,
        completedTasks,
        progressPercent:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalDocuments: onboardingCase.documents.length,
        verifiedDocuments: onboardingCase.documents.filter(
          (d) => d.status === 'VERIFIED',
        ).length,
      },
    };
  }

  async signOffer(employeeId: string) {
    const onboardingCase = await this.prisma.onboardingCase.findUnique({
      where: { employeeId },
    });

    if (!onboardingCase) {
      throw new NotFoundException('Onboarding case not found');
    }

    const updated = await this.prisma.onboardingCase.update({
      where: { id: onboardingCase.id },
      data: {
        offerSigned: true,
        status:
          onboardingCase.status === 'INVITED'
            ? 'OFFER_ACCEPTED'
            : onboardingCase.status,
      },
    });

    // Find if there is an offer letter task and auto-complete it
    const offerTask = await this.prisma.task.findFirst({
      where: {
        onboardingCaseId: onboardingCase.id,
        title: { contains: 'Offer', mode: 'insensitive' },
      },
    });

    if (offerTask) {
      await this.prisma.task.update({
        where: { id: offerTask.id },
        data: { status: 'COMPLETED' },
      });
    }

    await this.auditService.logAction(
      updated.companyId,
      employeeId,
      'UPDATE',
      'OnboardingCase',
      updated.id,
      { offerSigned: false },
      { offerSigned: true, action: 'DIGITAL_SIGNATURE' },
    );

    return updated;
  }

  async toggleTask(employeeId: string, taskId: string, isCompleted?: boolean) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.employeeId !== employeeId) {
      throw new ForbiddenException(
        'You can only update your own onboarding tasks',
      );
    }

    const nextStatus =
      isCompleted !== undefined
        ? isCompleted
          ? 'COMPLETED'
          : 'PENDING'
        : task.status === 'COMPLETED'
          ? 'PENDING'
          : 'COMPLETED';

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: nextStatus },
    });

    // If case status was INVITED or OFFER_ACCEPTED, advance it to IN_PROGRESS
    const currentCase = await this.prisma.onboardingCase.findUnique({
      where: { employeeId },
    });
    if (
      currentCase &&
      (currentCase.status === 'INVITED' ||
        currentCase.status === 'OFFER_ACCEPTED')
    ) {
      await this.prisma.onboardingCase.update({
        where: { id: currentCase.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return updatedTask;
  }

  async submitForVerification(employeeId: string) {
    const onboardingCase = await this.prisma.onboardingCase.findUnique({
      where: { employeeId },
      include: {
        tasks: true,
      },
    });

    if (!onboardingCase) {
      throw new NotFoundException('Onboarding case not found');
    }

    const updated = await this.prisma.onboardingCase.update({
      where: { id: onboardingCase.id },
      data: { status: 'PENDING_VERIFICATION' },
    });

    await this.auditService.logAction(
      updated.companyId,
      employeeId,
      'UPDATE',
      'OnboardingCase',
      updated.id,
      { status: onboardingCase.status },
      { status: 'PENDING_VERIFICATION' },
    );

    return updated;
  }

  // ==========================================
  // CASE AUTO-INITIALIZATION HELPER
  // ==========================================

  async initializeCaseForEmployee(
    companyId: string,
    employeeId: string,
    departmentId?: string,
    roleId?: string,
  ) {
    // Check if case already exists
    const existing = await this.prisma.onboardingCase.findUnique({
      where: { employeeId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },
        template: true,
        tasks: true,
        documents: true,
      },
    });

    if (existing) return existing;

    // Find best matching template for department or role
    let template = await this.prisma.onboardingTemplate.findFirst({
      where: {
        companyId,
        OR: [
          ...(departmentId ? [{ departmentId }] : []),
          ...(roleId ? [{ roleId }] : []),
        ],
      },
    });

    if (!template) {
      // Find generic template without specific dept/role
      template = await this.prisma.onboardingTemplate.findFirst({
        where: {
          companyId,
          departmentId: null,
          roleId: null,
        },
      });
    }

    // Create the case
    const newCase = await this.prisma.onboardingCase.create({
      data: {
        companyId,
        employeeId,
        templateId: template ? template.id : null,
        status: 'INVITED',
        offerSigned: false,
        bgvStatus: 'PENDING',
      },
    });

    // Seed tasks from template if found, otherwise use default checklist
    const tasksToSeed =
      template &&
      Array.isArray(template.taskChecklist) &&
      (template.taskChecklist as any[]).length > 0
        ? (template.taskChecklist as any[])
        : DEFAULT_ONBOARDING_TASKS;

    for (const task of tasksToSeed) {
      await this.prisma.task.create({
        data: {
          companyId,
          employeeId,
          onboardingCaseId: newCase.id,
          title: task.title,
          description: task.description || null,
          source: template ? 'TEMPLATE' : 'MANUAL',
          requiredForActivation: task.requiredForActivation ?? false,
          status: 'PENDING',
        },
      });
    }

    return this.prisma.onboardingCase.findUniqueOrThrow({
      where: { id: newCase.id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },
        template: true,
        tasks: true,
        documents: true,
      },
    });
  }
}
