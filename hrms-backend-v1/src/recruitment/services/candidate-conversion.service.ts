import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SequenceService } from './sequence.service';
import { AuditService } from '../../audit/audit.service';
import {
  ApplicationStatus,
  OfferStatus,
  CandidateActivityType,
  EmploymentStatus,
  EmployeeRole,
  JobRequisitionStatus,
} from '../../../generated/prisma/client';
import { ConvertCandidateDto } from '../dto/convert-candidate.dto';
import { Resend } from 'resend';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

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
export class CandidateConversionService {
  private resend: Resend;

  constructor(
    private prisma: PrismaService,
    private sequenceService: SequenceService,
    private auditService: AuditService,
  ) {
    this.resend = new Resend(
      process.env.RESEND_API_KEY || 're_placeholder_key',
    );
  }

  /**
   * Convert candidate with accepted offer into an employee.
   * Runs all DB mutations inside an atomic transaction with strict idempotency.
   * Dispatches welcome email post-commit.
   */
  async convertCandidateToEmployee(
    applicationId: string,
    companyId: string,
    actorId: string,
    dto?: ConvertCandidateDto,
  ) {
    // 1. PRE-FLIGHT VALIDATION
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, companyId },
      include: {
        candidate: true,
        jobRequisition: true,
        jobOffer: {
          include: {
            versions: {
              orderBy: { version: 'desc' },
            },
          },
        },
        conversion: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Candidate application not found');
    }

    // Idempotency check: Application already converted
    if (application.employeeId || application.conversion) {
      const existingEmployee = application.employeeId
        ? await this.prisma.employee.findUnique({
            where: { id: application.employeeId },
            select: { employeeCode: true, firstName: true, lastName: true },
          })
        : null;

      throw new ConflictException(
        `This candidate has already been converted to employee${
          existingEmployee?.employeeCode
            ? ` (${existingEmployee.employeeCode})`
            : ''
        }. Duplicate conversions are prevented.`,
      );
    }

    // Application status check
    if (application.status !== ApplicationStatus.OFFER_ACCEPTED) {
      throw new BadRequestException(
        `Candidate conversion requires application status OFFER_ACCEPTED. Current status is ${application.status}.`,
      );
    }

    // Job offer check
    if (!application.jobOffer) {
      throw new BadRequestException(
        'No job offer record found for this application.',
      );
    }

    if (application.jobOffer.status !== OfferStatus.ACCEPTED) {
      throw new BadRequestException(
        `Job offer must be ACCEPTED by candidate before conversion. Current offer status: ${application.jobOffer.status}.`,
      );
    }

    // Locate the accepted JobOfferVersion snapshot
    const acceptedVersion =
      application.jobOffer.versions.find(
        (v) => v.status === OfferStatus.ACCEPTED,
      ) || application.jobOffer.versions[0];

    if (!acceptedVersion) {
      throw new BadRequestException(
        'No valid JobOfferVersion found for compensation snapshot seeding.',
      );
    }

    // Duplicate email check
    const existingEmployeeWithEmail = await this.prisma.employee.findUnique({
      where: { email: application.candidate.email },
    });

    if (existingEmployeeWithEmail) {
      throw new ConflictException(
        `An employee with email "${application.candidate.email}" already exists in the system (${
          existingEmployeeWithEmail.employeeCode || existingEmployeeWithEmail.id
        }).`,
      );
    }

    // 2. ATOMIC DB TRANSACTION
    const conversionResult = await this.prisma.$transaction(async (tx) => {
      // 2.1 Generate sequential employee code following Company Settings format
      const targetDeptId =
        acceptedVersion.departmentId || application.jobRequisition.departmentId;

      const employeeCode = await this.sequenceService.generateEmployeeCode(
        companyId,
        targetDeptId,
        tx,
      );

      // 2.2 Generate secure one-time invite token and locked password hash
      const inviteToken = randomBytes(32).toString('hex');
      const tempLockedPassword = await bcrypt.hash(
        randomBytes(32).toString('hex'),
        10,
      );
      const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const joiningDate = dto?.joiningDate
        ? new Date(dto.joiningDate)
        : acceptedVersion.joiningDate;

      // 2.3 Create Employee in ONBOARDING status
      const employee = await tx.employee.create({
        data: {
          companyId,
          firstName: application.candidate.firstName,
          lastName: application.candidate.lastName,
          email: application.candidate.email,
          phone: application.candidate.phone,
          employeeCode,
          departmentId:
            acceptedVersion.departmentId ||
            application.jobRequisition.departmentId,
          designationId:
            acceptedVersion.designationId ||
            application.jobRequisition.designationId,
          reportingManagerId:
            dto?.reportingManagerId || acceptedVersion.reportingManagerId,
          joiningDate,
          employmentStatus: EmploymentStatus.ONBOARDING,
          role: EmployeeRole.EMPLOYEE,
          password: tempLockedPassword,
          inviteToken,
          resetPasswordExpires: tokenExpiry,
        },
      });

      // 2.4 Seed SalaryStructure from approved JobOfferVersion snapshot (100% parity, zero recalculation)
      const salaryStructure = await tx.salaryStructure.create({
        data: {
          companyId,
          employeeId: employee.id,
          basicSalary: acceptedVersion.basicSalary,
          hra: acceptedVersion.hra,
          conveyanceAllowance: acceptedVersion.conveyanceAllowance,
          medicalAllowance: acceptedVersion.medicalAllowance,
          specialAllowance: acceptedVersion.specialAllowance,
          otherAllowances: acceptedVersion.otherAllowances,
          pfContribution: acceptedVersion.pfContribution,
          taxDeduction: acceptedVersion.taxDeduction,
          professionalTax: acceptedVersion.professionalTax,
          effectiveDate: joiningDate,
        },
      });

      // 2.5 Find matching OnboardingTemplate
      let templateId: string | null = dto?.templateId ?? null;
      if (!templateId) {
        const matchedTemplate =
          (await tx.onboardingTemplate.findFirst({
            where: {
              companyId,
              OR: [
                ...(employee.departmentId
                  ? [{ departmentId: employee.departmentId }]
                  : []),
              ],
            },
          })) ||
          (await tx.onboardingTemplate.findFirst({
            where: {
              companyId,
              departmentId: null,
              roleId: null,
            },
          }));

        templateId = matchedTemplate?.id ?? null;
      }

      // 2.6 Create OnboardingCase with offerSigned: true
      const onboardingCase = await tx.onboardingCase.create({
        data: {
          companyId,
          employeeId: employee.id,
          templateId,
          status: 'IN_PROGRESS',
          offerSigned: true, // Signed and accepted in Phase 4
          bgvStatus: 'PENDING',
        },
      });

      // 2.7 Seed Onboarding Tasks
      let tasksToSeed = DEFAULT_ONBOARDING_TASKS;
      if (templateId) {
        const tpl = await tx.onboardingTemplate.findUnique({
          where: { id: templateId },
        });
        if (
          tpl &&
          Array.isArray(tpl.taskChecklist) &&
          (tpl.taskChecklist as any[]).length > 0
        ) {
          tasksToSeed = tpl.taskChecklist as any[];
        }
      }

      for (const t of tasksToSeed) {
        const isOfferAcceptedTask =
          t.title.toLowerCase().includes('offer') &&
          (t.title.toLowerCase().includes('letter') ||
            t.title.toLowerCase().includes('accept') ||
            t.title.toLowerCase().includes('sign'));

        await tx.task.create({
          data: {
            companyId,
            employeeId: employee.id,
            onboardingCaseId: onboardingCase.id,
            title: t.title,
            description: t.description || null,
            source: templateId ? 'TEMPLATE' : 'MANUAL',
            requiredForActivation: t.requiredForActivation ?? false,
            status: isOfferAcceptedTask ? 'COMPLETED' : 'PENDING',
          },
        });
      }

      // 2.8 Update JobRequisition filledCount & auto-closure check
      const newFilledCount = application.jobRequisition.filledCount + 1;
      const shouldCloseRequisition =
        newFilledCount >= application.jobRequisition.openings;

      await tx.jobRequisition.update({
        where: { id: application.jobRequisitionId },
        data: {
          filledCount: { increment: 1 },
          ...(shouldCloseRequisition && {
            status: JobRequisitionStatus.CLOSED,
          }),
        },
      });

      // 2.9 Update Application -> HIRED and link employeeId
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.HIRED,
          employeeId: employee.id,
        },
      });

      // 2.10 Create EmployeeConversion audit record
      const conversion = await tx.employeeConversion.create({
        data: {
          companyId,
          applicationId,
          candidateId: application.candidateId,
          employeeId: employee.id,
          convertedById: actorId,
        },
      });

      // 2.11 Log CandidateActivity (safe metadata, no sensitive salary numbers)
      await tx.candidateActivity.create({
        data: {
          companyId,
          applicationId,
          type: CandidateActivityType.CANDIDATE_HIRED,
          title: `Candidate successfully onboarded as Employee ${employeeCode}`,
          description: `Onboarding initiated with case ID ${onboardingCase.id}. Payroll salary structure seeded with 100% parity from approved offer version ${acceptedVersion.version}.`,
          performedById: actorId,
          metadata: {
            employeeId: employee.id,
            employeeCode: employeeCode,
            offerId: application.jobOffer!.id,
            offerVersion: acceptedVersion.version,
            onboardingCaseId: onboardingCase.id,
            conversionId: conversion.id,
          },
        },
      });

      return {
        employee,
        salaryStructure,
        onboardingCase,
        conversion,
        inviteToken,
        newFilledCount,
        shouldCloseRequisition,
      };
    });

    // 3. POST-COMMIT WELCOME EMAIL DISPATCH (Safe outside transaction)
    const magicLink = `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/set-password?token=${conversionResult.inviteToken}`;

    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL || 'GlobizHR <onboarding@resend.dev>';
      await this.resend.emails.send({
        from: fromEmail,
        to: application.candidate.email,
        subject: `Welcome to the Team! Set up your employee portal (${conversionResult.employee.employeeCode})`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #10b981; margin-bottom: 8px;">Welcome to the Team, ${application.candidate.firstName}!</h2>
            <p style="font-size: 14px; color: #64748b; margin-top: 0;">Your employment offer has been finalized and onboarding has officially commenced.</p>
            
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 4px 0; font-size: 14px;"><strong>Official Employee ID:</strong> <span style="font-family: monospace; color: #0f172a;">${conversionResult.employee.employeeCode}</span></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Position:</strong> ${application.jobRequisition.title}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> Onboarding in progress</p>
            </div>

            <p style="font-size: 14px; line-height: 1.5;">Please click the secure link below to set your permanent password and access your onboarding portal:</p>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${magicLink}" style="display: inline-block; padding: 12px 28px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">Set Password & Start Onboarding</a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
              This invitation link is valid for 7 days. If you did not expect this invitation, please contact HR immediately.
            </p>
          </div>
        `,
      });
      console.log(
        `✅ Onboarding welcome email sent to ${application.candidate.email}`,
      );
    } catch (emailErr) {
      console.error(
        '❌ Failed to dispatch onboarding welcome email:',
        emailErr,
      );
    }

    // 4. AUDIT LOG
    await this.auditService.logAction(
      companyId,
      actorId,
      'UPDATE',
      'Application',
      applicationId,
      { status: ApplicationStatus.OFFER_ACCEPTED },
      {
        status: ApplicationStatus.HIRED,
        employeeId: conversionResult.employee.id,
        employeeCode: conversionResult.employee.employeeCode,
      },
    );

    return {
      success: true,
      message: `Candidate successfully converted to employee ${conversionResult.employee.employeeCode}`,
      employee: {
        id: conversionResult.employee.id,
        employeeCode: conversionResult.employee.employeeCode,
        firstName: conversionResult.employee.firstName,
        lastName: conversionResult.employee.lastName,
        email: conversionResult.employee.email,
        employmentStatus: conversionResult.employee.employmentStatus,
        joiningDate: conversionResult.employee.joiningDate,
      },
      onboardingCase: {
        id: conversionResult.onboardingCase.id,
        status: conversionResult.onboardingCase.status,
      },
      application: {
        id: applicationId,
        status: ApplicationStatus.HIRED,
      },
      requisition: {
        id: application.jobRequisitionId,
        newFilledCount: conversionResult.newFilledCount,
        isClosed: conversionResult.shouldCloseRequisition,
      },
    };
  }

  /**
   * Preview employee code and configuration that will be applied upon conversion
   */
  async getConversionPreview(applicationId: string, companyId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, companyId },
      include: {
        candidate: true,
        jobRequisition: {
          include: { department: true },
        },
        jobOffer: {
          include: {
            versions: {
              orderBy: { version: 'desc' },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Candidate application not found');
    }

    const acceptedVersion =
      application.jobOffer?.versions.find(
        (v) => v.status === OfferStatus.ACCEPTED,
      ) || application.jobOffer?.versions[0];

    const targetDeptId =
      acceptedVersion?.departmentId || application.jobRequisition.departmentId;

    const previewCode = await this.sequenceService.generateEmployeeCode(
      companyId,
      targetDeptId,
    );

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { settings: true },
    });

    return {
      targetEmployeeCode: previewCode,
      format: company?.settings?.employeeIdFormat || '{PREFIX}-{DEPT}-{NUMBER}',
      prefix:
        company?.settings?.employeeIdPrefix ||
        company?.name?.substring(0, 3).toUpperCase() ||
        'EMP',
      departmentName: application.jobRequisition.department?.name || 'General',
    };
  }
}
