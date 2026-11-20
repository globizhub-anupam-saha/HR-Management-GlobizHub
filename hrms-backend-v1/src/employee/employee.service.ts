import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { BulkImportEmployeeRowDto } from './dto/bulk-import-employee.dto';
import * as bcrypt from 'bcrypt';
import { Resend } from 'resend';
import { randomBytes, createHash } from 'crypto';
import { S3Service } from '../s3/s3.service';
import { encrypt, decrypt } from '../common/utils/encryption.util';
import { AuditService } from '../audit/audit.service';
import { generateDepartmentScopedEmployeeCode } from './utils/employee-code.util';

const SENSITIVE_FIELDS = [
  'bankName',
  'accountNumber',
  'ifscCode',
  'panNumber',
  'nationalId',
  'pfAccountNumber',
  'uanNumber',
];

function encryptPayload(payload: any) {
  if (!payload) return payload;
  const clone = { ...payload };
  for (const field of SENSITIVE_FIELDS) {
    if (clone[field] !== undefined && clone[field] !== null) {
      clone[field] = encrypt(clone[field]);
    }
  }
  return clone;
}

function decryptEmployee(employee: any) {
  if (!employee) return employee;
  for (const field of SENSITIVE_FIELDS) {
    if (employee[field] !== undefined && employee[field] !== null) {
      employee[field] = decrypt(employee[field]);
    }
  }
  return employee;
}

@Injectable()
export class EmployeeService {
  private resend: Resend;

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private auditService: AuditService,
  ) {
    this.resend = new Resend(
      process.env.RESEND_API_KEY || 're_placeholder_key',
    );
  }

  async findAllByCompany(companyId: string, query?: QueryEmployeesDto) {
    const where: any = { companyId };

    // 1. Employment Status Filter (defaults to all if 'ALL' or empty, else filters by status)
    if (query?.status && query.status.toUpperCase() !== 'ALL') {
      where.employmentStatus = query.status.toUpperCase();
    }

    // 2. Department Filter
    if (query?.departmentId && query.departmentId !== 'all') {
      where.departmentId = query.departmentId;
    }

    // 3. Role Filter
    if (query?.role && query.role !== 'all') {
      where.role = query.role;
    }

    // 4. Search Filter (first name, last name, email, employee code)
    if (query?.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { employeeCode: { contains: term, mode: 'insensitive' } },
      ];
    }

    return this.prisma.employee.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        employmentStatus: true, // ✅ Fetch status for card/list view badges
        profilePhoto: true, // ✅ Fetch profile photo for card/list view
        employeeCode: true, // ✅ Ensure the code is fetched for the frontend list
        gender: true, // ✅ Fetch gender for stats
        createdAt: true, // ✅ Fetch createdAt for stats
        reportingManagerId: true,
        reportingManager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        designationId: true,
        designation: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async inviteEmployee(
    companyId: string,
    dto: CreateEmployeeDto,
    actorId?: string,
  ) {
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });

    if (existingEmployee) {
      throw new ConflictException(
        'An employee with this email already exists.',
      );
    }

    // S-03: Unusable temporary password — employee MUST set via invite link
    const tempPassword = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    // S-14: Store a SHA-256 hash of the invite token; the raw token goes in the email
    const rawInviteToken = randomBytes(32).toString('hex');
    const inviteToken = createHash('sha256')
      .update(rawInviteToken)
      .digest('hex');

    // Create employee in INVITED status without an Employee ID yet (assigned upon onboarding completion)
    const newEmployee = await this.prisma.employee.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        role: dto.role,
        password: tempPassword,
        companyId: companyId,
        inviteToken: inviteToken,
        resetPasswordExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        employeeCode: null, // Defer ID generation until onboarding completion
        employmentStatus: 'INVITED',
        ...(dto.departmentId && { departmentId: dto.departmentId }),
        ...(dto.designationId && { designationId: dto.designationId }),
        ...(dto.reportingManagerId && {
          reportingManagerId: dto.reportingManagerId,
        }),
        ...(dto.uanNumber && { uanNumber: encrypt(dto.uanNumber) }),
      },
    });

    // Automatically create statutory profile if UAN / ESIC IP number is provided
    if (dto.establishmentId || dto.esicIpNumber || dto.uanNumber) {
      try {
        let targetEstId = dto.establishmentId;
        if (!targetEstId) {
          let firstEst = await this.prisma.statutoryEstablishment.findFirst({
            where: { companyId },
          });
          if (!firstEst) {
            firstEst = await this.prisma.statutoryEstablishment.create({
              data: {
                companyId,
                name: 'Default Establishment',
                epfoEstablishmentCode: 'DEFAULT',
                esicEmployerCode: 'DEFAULT',
              },
            });
          }
          targetEstId = firstEst?.id;
        }

        if (targetEstId) {
          await this.prisma.employeeStatutoryProfile.create({
            data: {
              employeeId: newEmployee.id,
              establishmentId: targetEstId,
              epfoUan: dto.uanNumber || null,
              esicIpNumber: dto.esicIpNumber || null,
            },
          });
        }
      } catch (statutoryError) {
        console.error(
          'Failed to auto-create statutory profile:',
          statutoryError,
        );
      }
    }

    const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${rawInviteToken}`;

    try {
      const fromEmail =
        process.env.RESEND_FROM_EMAIL ||
        process.env.SENDER_EMAIL ||
        'GlobizHR <onboarding@resend.dev>';
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: dto.email,
        subject: 'Welcome to the Team! Set your password',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Welcome to GlobizHR, ${dto.firstName}!</h2>
            <p>You have been invited to join your company's HRMS workspace.</p>
            <p>Your official Employee ID will be generated upon completion and verification of your onboarding checklist.</p>
            <p>Please click the secure link below to set your permanent password and complete your onboarding.</p>
            <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; margin-top: 15px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Set Password & Start Onboarding</a>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        `,
      });
      if (error) {
        console.error(
          '❌ Resend API returned error for employee invitation:',
          error,
        );
      } else {
        console.log(
          `✅ Onboarding invitation email sent to ${dto.email} (Message ID: ${data?.id})`,
        );
      }
    } catch (emailError) {
      console.error(
        '❌ Failed to send onboarding invitation email via Resend:',
        emailError,
      );
      // We log the error but do not throw, so the creation process completes successfully.
    }

    // Initialize Onboarding Case & standard checklist tasks
    try {
      const newCase = await this.prisma.onboardingCase.create({
        data: {
          companyId,
          employeeId: newEmployee.id,
          status: 'INVITED',
          offerSigned: false,
          bgvStatus: 'PENDING',
        },
      });

      const defaultTasks = [
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
      ];

      for (const t of defaultTasks) {
        await this.prisma.task.create({
          data: {
            companyId,
            employeeId: newEmployee.id,
            onboardingCaseId: newCase.id,
            title: t.title,
            description: t.description,
            source: 'TEMPLATE',
            requiredForActivation: t.requiredForActivation,
            status: 'PENDING',
          },
        });
      }
    } catch (caseErr) {
      console.error(
        'Failed to initialize onboarding case for invited employee:',
        caseErr,
      );
    }

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'CREATE',
      'Employee',
      newEmployee.id,
      null,
      {
        email: newEmployee.email,
        role: newEmployee.role,
        employeeCode: newEmployee.employeeCode,
      },
    );

    const {
      password: _password,
      inviteToken: _hiddenToken,
      ...result
    } = newEmployee;
    return result;
  }

  async updateEmployee(
    companyId: string,
    employeeId: string,
    dto: UpdateEmployeeDto,
    actorId?: string,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId: companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found in your workspace');
    }

    const isDepartmentChanging =
      dto.departmentId !== undefined &&
      dto.departmentId !== employee.departmentId;

    let targetEmployeeCode = dto.employeeCode;

    if (
      dto.employeeCode !== undefined &&
      dto.employeeCode !== employee.employeeCode
    ) {
      if (dto.employeeCode && dto.employeeCode.trim()) {
        const trimmedCode = dto.employeeCode.trim();
        const existingWithCode = await this.prisma.employee.findFirst({
          where: {
            companyId,
            employeeCode: trimmedCode,
            id: { not: employeeId },
          },
        });
        if (existingWithCode) {
          throw new ConflictException(
            `Employee ID '${trimmedCode}' is already assigned to another employee.`,
          );
        }
        targetEmployeeCode = trimmedCode;
      } else {
        targetEmployeeCode = null;
      }
    } else if (isDepartmentChanging) {
      // Automatically generate a new department-scoped ID when department changes
      targetEmployeeCode = await generateDepartmentScopedEmployeeCode({
        prisma: this.prisma,
        companyId,
        departmentId: dto.departmentId,
        excludeEmployeeId: employeeId,
      });
    }

    const { esicIpNumber, establishmentId, ...restDto } = dto;
    if (targetEmployeeCode !== undefined) {
      (restDto as any).employeeCode = targetEmployeeCode;
    }
    const encryptedData = encryptPayload(restDto);

    const updated = await this.prisma.employee.update({
      where: { id: employeeId },
      data: encryptedData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        employeeCode: true,
        uanNumber: true,
        departmentId: true,
      },
    });

    if (isDepartmentChanging) {
      await this.auditService.logAction(
        companyId,
        actorId || null,
        'UPDATE',
        'Employee',
        employeeId,
        {
          departmentId: employee.departmentId,
          employeeCode: employee.employeeCode,
        },
        {
          departmentId: dto.departmentId,
          employeeCode: updated.employeeCode,
        },
      );
    }

    if (
      establishmentId !== undefined ||
      esicIpNumber !== undefined ||
      dto.uanNumber !== undefined
    ) {
      try {
        let targetEstId = establishmentId;
        if (!targetEstId) {
          let firstEst = await this.prisma.statutoryEstablishment.findFirst({
            where: { companyId },
          });
          if (!firstEst) {
            firstEst = await this.prisma.statutoryEstablishment.create({
              data: {
                companyId,
                name: 'Default Establishment',
                epfoEstablishmentCode: 'DEFAULT',
                esicEmployerCode: 'DEFAULT',
              },
            });
          }
          targetEstId = firstEst.id;
        }

        if (targetEstId) {
          const existingProfile =
            await this.prisma.employeeStatutoryProfile.findFirst({
              where: { employeeId },
            });

          if (existingProfile) {
            await this.prisma.employeeStatutoryProfile.update({
              where: { id: existingProfile.id },
              data: {
                ...(establishmentId ? { establishmentId: targetEstId } : {}),
                epfoUan:
                  dto.uanNumber !== undefined
                    ? dto.uanNumber
                    : existingProfile.epfoUan,
                esicIpNumber:
                  esicIpNumber !== undefined
                    ? esicIpNumber
                    : existingProfile.esicIpNumber,
              },
            });
          } else {
            await this.prisma.employeeStatutoryProfile.create({
              data: {
                employeeId,
                establishmentId: targetEstId,
                epfoUan: dto.uanNumber || null,
                esicIpNumber: esicIpNumber || null,
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to update employee statutory profile:', err);
      }
    }

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'Employee',
      employeeId,
      {
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
      },
      {
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
      },
    );

    return updated;
  }

  async removeEmployee(
    companyId: string,
    employeeId: string,
    actorId?: string,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId: companyId },
    });

    if (!employee) {
      throw new ConflictException('Employee not found in your workspace');
    }

    const deleted = await this.prisma.employee.delete({
      where: { id: employeeId },
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'DELETE',
      'Employee',
      employeeId,
      {
        email: employee.email,
        name: `${employee.firstName} ${employee.lastName}`,
      },
      null,
    );

    return deleted;
  }

  // ==========================================
  // EMPLOYEE SELF-SERVICE
  // ==========================================

  async updateMyProfile(
    employeeId: string,
    // S-01: strongly-typed DTO; ValidationPipe(whitelist:true) already stripped unknown fields
    rawData: object,
    file?: Express.Multer.File,
  ) {
    // Defense-in-depth: explicitly remove any privilege-escalation fields
    // even though the DTO should have already prevented them.

    const data: any = { ...rawData };
    const FORBIDDEN = [
      'id',
      'companyId',
      'departmentId',
      'roleId',
      'role',
      'email',
      'employeeId',
      'joiningDate',
      'employmentStatus',
      'designationId',
      'reportingManagerId',
      'password',
      'inviteToken',
      'resetPasswordToken',
      'resetPasswordExpires',
    ] as const;
    for (const field of FORBIDDEN) delete data[field as string];

    if (file) {
      data.profilePhoto = await this.s3Service.uploadFile(
        file,
        'profile-photos',
      );
    }

    if (data.bloodGroup === '') {
      data.bloodGroup = null;
    } else if (data.bloodGroup) {
      const mapping: Record<string, string> = {
        'O+': 'O_POS',
        'O-': 'O_NEG',
        'A+': 'A_POS',
        'A-': 'A_NEG',
        'B+': 'B_POS',
        'B-': 'B_NEG',
        'AB+': 'AB_POS',
        'AB-': 'AB_NEG',
      };
      if (mapping[data.bloodGroup]) {
        data.bloodGroup = mapping[data.bloodGroup];
      }
    }

    if (data.gender === '') {
      data.gender = null;
    }

    const { esicIpNumber, ...restData } = data;
    const encryptedData = encryptPayload(restData);

    const updated = await this.prisma.employee.update({
      where: { id: employeeId },
      data: encryptedData,
    });

    if (data.uanNumber !== undefined || esicIpNumber !== undefined) {
      try {
        let firstEst = await this.prisma.statutoryEstablishment.findFirst({
          where: { companyId: updated.companyId },
        });
        if (!firstEst) {
          firstEst = await this.prisma.statutoryEstablishment.create({
            data: {
              companyId: updated.companyId,
              name: 'Default Establishment',
              epfoEstablishmentCode: 'DEFAULT',
              esicEmployerCode: 'DEFAULT',
            },
          });
        }
        if (firstEst) {
          const existingProfile =
            await this.prisma.employeeStatutoryProfile.findFirst({
              where: { employeeId },
            });

          if (existingProfile) {
            await this.prisma.employeeStatutoryProfile.update({
              where: { id: existingProfile.id },
              data: {
                epfoUan:
                  data.uanNumber !== undefined
                    ? data.uanNumber
                    : existingProfile.epfoUan,
                esicIpNumber:
                  esicIpNumber !== undefined
                    ? esicIpNumber
                    : existingProfile.esicIpNumber,
              },
            });
          } else {
            await this.prisma.employeeStatutoryProfile.create({
              data: {
                employeeId,
                establishmentId: firstEst.id,
                epfoUan: data.uanNumber || null,
                esicIpNumber: esicIpNumber || null,
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to sync self statutory profile:', err);
      }
    }

    await this.auditService.logAction(
      updated.companyId,
      employeeId,
      'UPDATE',
      'Employee',
      employeeId,
      { info: 'Self Profile Update (fields modified)' },
      { info: 'Self Profile Update Complete' },
    );

    return decryptEmployee(updated);
  }

  async getMyDevices(employeeId: string) {
    return this.prisma.employeeDevice.findMany({
      where: { employeeId },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  async registerMyDevice(
    employeeId: string,
    deviceName: string,
    deviceIdentifier: string,
  ) {
    return this.prisma.employeeDevice.upsert({
      where: { deviceIdentifier },
      update: { lastUsedAt: new Date(), deviceName },
      create: {
        employeeId,
        deviceName,
        deviceIdentifier,
        status: 'APPROVED',
      },
    });
  }

  async revokeMyDevice(employeeId: string, deviceId: string) {
    return this.prisma.employeeDevice.deleteMany({
      where: { id: deviceId, employeeId },
    });
  }

  async updateMyNotifications(employeeId: string, data: any) {
    delete data.id;
    delete data.employeeId;

    return this.prisma.notificationSettings.upsert({
      where: { employeeId },
      update: data,
      create: {
        employeeId,
        ...data,
      },
    });
  }

  // ==========================================
  // EMPLOYEE LIFECYCLE & DETAILS
  // ==========================================

  async getEmergencyContacts(employeeId: string) {
    return this.prisma.emergencyContact.findMany({
      where: { employeeId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  async addEmergencyContact(
    employeeId: string,
    data: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
      isPrimary?: boolean;
    },
  ) {
    return this.prisma.emergencyContact.create({
      data: { ...data, employeeId },
    });
  }

  async getSkills(employeeId: string) {
    return this.prisma.employeeSkill.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addSkill(
    employeeId: string,
    data: { name: string; proficiencyLevel: string },
  ) {
    return this.prisma.employeeSkill.create({
      data: { ...data, employeeId },
    });
  }

  async getEmploymentHistory(employeeId: string) {
    return this.prisma.employmentHistory.findMany({
      where: { employeeId },
      orderBy: { startDate: 'desc' },
    });
  }

  async addEmploymentHistory(
    employeeId: string,
    data: {
      companyName: string;
      jobTitle: string;
      startDate: Date;
      endDate?: Date;
      reasonForLeaving?: string;
    },
  ) {
    return this.prisma.employmentHistory.create({
      data: { ...data, employeeId },
    });
  }

  async processEmployeeExit(
    employeeId: string,
    data: { exitDate: Date; reason: string; notes?: string },
  ) {
    return this.prisma.employeeExit.upsert({
      where: { employeeId },
      update: {
        exitDate: new Date(data.exitDate),
        reason: data.reason,
        exitInterviewNotes: data.notes,
      },
      create: {
        employeeId,
        exitDate: new Date(data.exitDate),
        reason: data.reason,
        exitInterviewNotes: data.notes,
      },
    });
  }

  async findEmployeeById(companyId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
      include: {
        skills: true,
        emergencyContacts: true,
        employmentHistory: { orderBy: { startDate: 'desc' } },
        exitRecord: true,
        credentials: true,
        designation: true,
        department: true,
        reportingManager: true,
        statutoryProfiles: {
          include: {
            establishment: true,
          },
        },
      },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found in your workspace');
    }
    const decrypted = decryptEmployee(employee);
    const activeStat = employee.statutoryProfiles?.[0];
    return {
      ...decrypted,
      uanNumber: decrypted.uanNumber || activeStat?.epfoUan || null,
      esicIpNumber: activeStat?.esicIpNumber || null,
      establishmentId: activeStat?.establishmentId || null,
    };
  }

  async resendInvite(companyId: string, employeeId: string, actorId?: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found in your workspace.');
    }
    if (employee.employmentStatus !== 'INVITED') {
      throw new ConflictException(
        'Invitation can only be resent to employees with INVITED status.',
      );
    }

    const rawInviteToken = randomBytes(32).toString('hex');
    const inviteToken = createHash('sha256')
      .update(rawInviteToken)
      .digest('hex');

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        inviteToken,
        resetPasswordExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/set-password?token=${rawInviteToken}`;
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.SENDER_EMAIL ||
      'GlobizHR <onboarding@resend.dev>';

    try {
      await this.resend.emails.send({
        from: fromEmail,
        to: employee.email,
        subject: 'Reminder: Welcome to the Team! Set your password',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Invitation Reminder for ${employee.firstName}!</h2>
            <p>You have been invited to join your company's HRMS workspace.</p>
            <p>Please click the link below to set your permanent password and start onboarding:</p>
            <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; margin-top: 15px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Set Password & Start Onboarding</a>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">This invite link is valid for 7 days.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Failed to resend invite email:', err);
    }

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'Employee',
      employeeId,
      null,
      { action: 'RESEND_INVITATION', email: employee.email },
    );

    return {
      success: true,
      message: `Invitation email resent successfully to ${employee.email}`,
    };
  }

  async removeSkill(employeeId: string, skillId: string) {
    const skill = await this.prisma.employeeSkill.findFirst({
      where: { id: skillId, employeeId },
    });
    if (!skill)
      throw new NotFoundException('Skill not found for this employee');

    return this.prisma.employeeSkill.delete({ where: { id: skillId } });
  }

  async removeEmergencyContact(employeeId: string, contactId: string) {
    const contact = await this.prisma.emergencyContact.findFirst({
      where: { id: contactId, employeeId },
    });
    if (!contact) throw new NotFoundException('Emergency contact not found');

    return this.prisma.emergencyContact.delete({ where: { id: contactId } });
  }

  async removeEmploymentHistory(employeeId: string, historyId: string) {
    const history = await this.prisma.employmentHistory.findFirst({
      where: { id: historyId, employeeId },
    });
    if (!history)
      throw new NotFoundException('Employment history record not found');

    return this.prisma.employmentHistory.delete({ where: { id: historyId } });
  }

  // ==========================================
  // ORG CHART & REPORTING HIERARCHY
  // ==========================================
  async getOrgChart(companyId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId, employmentStatus: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        profilePhoto: true,
        employeeCode: true,
        reportingManagerId: true,
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const empMap = new Map<string, any>();
    const childrenMap = new Map<string, string[]>();

    employees.forEach((emp) => {
      empMap.set(emp.id, emp);
      childrenMap.set(emp.id, []);
    });

    const rootIds: string[] = [];

    employees.forEach((emp) => {
      if (emp.reportingManagerId && empMap.has(emp.reportingManagerId)) {
        childrenMap.get(emp.reportingManagerId)!.push(emp.id);
      } else {
        rootIds.push(emp.id);
      }
    });

    const buildNode = (id: string, depth = 1): any => {
      const emp = empMap.get(id);
      const childIds = childrenMap.get(id) || [];
      const children = childIds.map((cid) => buildNode(cid, depth + 1));
      const totalSubordinates = children.reduce(
        (sum: number, c: any) => sum + 1 + c.totalSubordinatesCount,
        0,
      );

      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        name: (emp.firstName + ' ' + emp.lastName).trim(),
        email: emp.email,
        role: emp.role,
        profilePhoto: emp.profilePhoto,
        department: emp.department?.name || null,
        designation: emp.designation?.name || null,
        designationColor: emp.designation?.color || null,
        depth,
        directReportsCount: childIds.length,
        totalSubordinatesCount: totalSubordinates,
        children,
      };
    };

    const tree = rootIds.map((rid) => buildNode(rid, 1));
    return {
      roots: tree,
      totalEmployees: employees.length,
    };
  }

  // ==========================================
  // COMPLIANCE: GDPR / DPDP DATA PORTABILITY
  // ==========================================
  async exportEmployeeData(companyId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
      include: {
        department: true,
        designation: true,
        emergencyContacts: true,
        skills: true,
        employmentHistory: true,
        devices: true,
        notificationSettings: true,
        leaveRequests: { take: 50, orderBy: { createdAt: 'desc' } },
        attendances: { take: 60, orderBy: { date: 'desc' } },
        payrollRecords: { take: 24, orderBy: { createdAt: 'desc' } },
        documents: true,
        exitRecord: true,
      },
    });

    if (!employee)
      throw new NotFoundException('Employee not found in your workspace');

    const decrypted = decryptEmployee(employee);
    delete (decrypted as any).password;
    delete (decrypted as any).inviteToken;
    delete (decrypted as any).resetPasswordToken;

    return {
      exportedAt: new Date().toISOString(),
      complianceStandard: 'GDPR_Article_15 / DPDP_Right_to_Access',
      subject: decrypted,
    };
  }

  // ==========================================
  // COMPLIANCE: RIGHT TO ERASURE (ANONYMIZATION)
  // ==========================================
  async anonymizeEmployee(
    companyId: string,
    employeeId: string,
    actorId: string,
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });
    if (!employee)
      throw new NotFoundException('Employee not found in your workspace');

    const anonHash = createHash('sha256')
      .update(employee.id + Date.now().toString())
      .digest('hex')
      .substring(0, 10);
    const anonymizedEmail = 'erased.' + anonHash + '@anonymized.internal';

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName: 'Anonymized',
        lastName: 'Individual',
        email: anonymizedEmail,
        phone: null,
        profilePhoto: null,
        employmentStatus: 'TERMINATED',
        bankName: null,
        accountNumber: null,
        ifscCode: null,
        panNumber: null,
        nationalId: null,
        pfAccountNumber: null,
        uanNumber: null,
      },
    });

    await this.auditService.logAction(
      companyId,
      actorId,
      'UPDATE',
      'Employee',
      employeeId,
      null,
      { action: 'DPDP_GDPR_RIGHT_TO_ERASURE', originalEmailHash: anonHash },
    );

    return {
      success: true,
      message:
        'Employee personal data permanently anonymized in compliance with DPDP/GDPR.',
    };
  }

  // ==========================================
  // BULK EMPLOYEE CSV / EXCEL IMPORT
  // ==========================================
  async bulkImportEmployees(
    companyId: string,
    employees: BulkImportEmployeeRowDto[],
    actorId?: string,
  ) {
    if (!employees || employees.length === 0) {
      return {
        success: true,
        totalProcessed: 0,
        importedCount: 0,
        skippedCount: 0,
        imported: [],
        skipped: [],
      };
    }

    // 1. Fetch tenant departments and designations for auto-matching
    const companyDepts = await this.prisma.department.findMany({
      where: { companyId },
    });
    const deptMap = new Map<string, string>();
    companyDepts.forEach((d) => {
      deptMap.set(d.name.trim().toLowerCase(), d.id);
    });

    const companyDesignations = await this.prisma.designation.findMany({
      where: { companyId },
    });
    const desigMap = new Map<string, string>();
    companyDesignations.forEach((d) => {
      desigMap.set(d.name.trim().toLowerCase(), d.id);
    });

    // 2. Filter & normalize incoming rows
    const seenEmailsInBatch = new Set<string>();
    const candidates: BulkImportEmployeeRowDto[] = [];
    const skipped: Array<{ email: string; reason: string }> = [];

    for (const row of employees) {
      const email = row.email?.trim().toLowerCase();
      if (!email || !email.includes('@')) {
        skipped.push({
          email: row.email || 'N/A',
          reason: 'Invalid or missing email address',
        });
        continue;
      }
      if (seenEmailsInBatch.has(email)) {
        skipped.push({
          email,
          reason: 'Duplicate email within the same import file',
        });
        continue;
      }
      seenEmailsInBatch.add(email);
      candidates.push({
        ...row,
        email,
      });
    }

    // 3. Batch check for already existing employees in DB
    const candidateEmails = candidates.map((c) => c.email);
    const existingEmployees = await this.prisma.employee.findMany({
      where: {
        email: { in: candidateEmails },
      },
      select: { email: true },
    });
    const existingEmailSet = new Set(
      existingEmployees.map((e) => e.email.toLowerCase()),
    );

    // 4. Process each non-duplicate employee
    const imported: Array<{ id: string; email: string; name: string }> = [];
    const tempPasswordHash = await bcrypt.hash(
      randomBytes(32).toString('hex'),
      10,
    );

    const defaultTasks = [
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
    ];

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.SENDER_EMAIL ||
      'GlobizHR <onboarding@resend.dev>';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    for (const row of candidates) {
      if (existingEmailSet.has(row.email)) {
        skipped.push({
          email: row.email,
          reason: 'An employee with this email already exists in the system',
        });
        continue;
      }

      // Department & Designation matching
      let departmentId: string | null = null;
      if (row.department) {
        departmentId = deptMap.get(row.department.trim().toLowerCase()) || null;
      }

      let designationId: string | null = null;
      if (row.designation) {
        designationId =
          desigMap.get(row.designation.trim().toLowerCase()) || null;
      }

      // Role sanitization (super admins cannot be assigned via bulk import)
      let assignedRole: any = 'EMPLOYEE';
      if (row.role) {
        const upper = row.role.toUpperCase().replace(/\s+/g, '_');
        if (['HR_HEAD', 'MANAGER', 'EMPLOYEE'].includes(upper)) {
          assignedRole = upper;
        }
      }

      const rawInviteToken = randomBytes(32).toString('hex');
      const inviteToken = createHash('sha256')
        .update(rawInviteToken)
        .digest('hex');

      const firstName =
        row.firstName?.trim() || row.email.split('@')[0] || 'Team';
      const lastName = row.lastName?.trim() || 'Member';

      try {
        const createdEmp = await this.prisma.employee.create({
          data: {
            companyId,
            firstName,
            lastName,
            email: row.email,
            phone: row.phone?.trim() || null,
            password: tempPasswordHash,
            role: assignedRole,
            employeeCode: null,
            employmentStatus: 'INVITED',
            departmentId,
            designationId,
            inviteToken,
            resetPasswordExpires: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ),
          },
        });

        // Initialize Onboarding Case & standard checklist tasks
        try {
          const newCase = await this.prisma.onboardingCase.create({
            data: {
              companyId,
              employeeId: createdEmp.id,
              status: 'INVITED',
              offerSigned: false,
              bgvStatus: 'PENDING',
            },
          });

          for (const t of defaultTasks) {
            await this.prisma.task.create({
              data: {
                companyId,
                employeeId: createdEmp.id,
                onboardingCaseId: newCase.id,
                title: t.title,
                description: t.description,
                source: 'TEMPLATE',
                requiredForActivation: t.requiredForActivation,
                status: 'PENDING',
              },
            });
          }
        } catch (caseErr) {
          console.error(
            'Failed to initialize onboarding case for bulk import:',
            caseErr,
          );
        }

        // Send invite email asynchronously via Resend
        const magicLink = `${frontendUrl}/set-password?token=${rawInviteToken}`;
        try {
          await this.resend.emails.send({
            from: fromEmail,
            to: row.email,
            subject: 'Welcome to the Team! Set your password',
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10b981;">Welcome to GlobizHR, ${firstName}!</h2>
                <p>You have been invited to join your company's HRMS workspace.</p>
                <p>Your official Employee ID will be generated upon completion and verification of your onboarding checklist.</p>
                <p>Please click the secure link below to set your permanent password and complete your onboarding.</p>
                <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; margin-top: 15px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Set Password & Start Onboarding</a>
                <p style="margin-top: 30px; font-size: 12px; color: #888;">If you didn't expect this invitation, you can safely ignore this email.</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error(
            `Failed to send bulk invite email to ${row.email}:`,
            emailErr,
          );
        }

        // Audit log
        await this.auditService.logAction(
          companyId,
          actorId || null,
          'CREATE',
          'Employee',
          createdEmp.id,
          null,
          { action: 'BULK_IMPORT_INVITE', email: createdEmp.email },
        );

        imported.push({
          id: createdEmp.id,
          email: createdEmp.email,
          name: `${firstName} ${lastName}`,
        });
      } catch (err: any) {
        console.error(`Error importing employee ${row.email}:`, err);
        skipped.push({
          email: row.email,
          reason: err.message || 'Database error during employee creation',
        });
      }
    }

    return {
      success: true,
      totalProcessed: employees.length,
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped,
    };
  }
}
