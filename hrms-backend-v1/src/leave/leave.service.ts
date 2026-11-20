import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaveStatus, TransactionType } from '../../generated/prisma/client';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';
import { AdjustLeaveBalanceDto } from './dto/adjust-leave-balance.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ==========================================
  // HELPERS: SMART DATE CALCULATION
  // ==========================================

  private parseValidDate(
    dateValue: string | Date,
    label: 'start' | 'end',
  ): Date {
    if (!dateValue) {
      throw new BadRequestException(
        `Invalid leave date: ${label} date is invalid.`,
      );
    }

    if (dateValue instanceof Date) {
      return dateValue;
    }

    const dateStr =
      typeof dateValue === 'string' ? dateValue.trim() : String(dateValue);
    let parsed = new Date(dateStr);

    // If standard parsing fails (returns NaN) or is incorrect, check for DD-MM-YYYY, DD/MM/YYYY, or DD.MM.YYYY
    if (Number.isNaN(parsed.getTime())) {
      const parts = dateStr.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
      if (parts) {
        const day = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1; // 0-indexed month
        const year = parseInt(parts[3], 10);
        parsed = new Date(year, month, day);
      }
    }

    if (Number.isNaN(parsed.getTime())) {
      console.error(
        `Invalid leave date parsing error. Label: ${label}, Received Value: ${JSON.stringify(dateValue)}`,
      );
      throw new BadRequestException(
        `Invalid leave date: ${label} date is invalid.`,
      );
    }

    return parsed;
  }

  private async calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    companyId: string,
  ): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid leave date range.');
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const holidays = await this.prisma.holiday.findMany({
      where: {
        companyId,
        date: { gte: start, lte: end },
      },
      select: { date: true },
    });

    const holidayDates = holidays.map((h) => h.date.getTime());

    // Fetch company working days setting (default: Mon-Fri if not configured)
    const settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
      select: { workingDays: true },
    });
    const dayNames = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const workingDaysList = settings?.workingDays;
    const hasConfiguredWorkingDays =
      Array.isArray(workingDaysList) && workingDaysList.length > 0;

    let workingDays = 0;
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const dayName = dayNames[dayOfWeek];
      const isWorkingDay = hasConfiguredWorkingDays
        ? workingDaysList.includes(dayName)
        : dayOfWeek !== 0 && dayOfWeek !== 6; // Fallback: 0 = Sun, 6 = Sat
      const isHoliday = holidayDates.includes(currentDate.getTime());

      if (isWorkingDay && !isHoliday) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  // ==========================================
  // HR/ADMIN: Create Company Leave Policies
  // ==========================================

  async createLeavePolicy(companyId: string, dto: CreateLeavePolicyDto) {
    return this.prisma.leavePolicy.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async getCompanyPolicies(companyId: string) {
    return this.prisma.leavePolicy.findMany({
      where: { companyId },
    });
  }

  async updateLeavePolicy(
    companyId: string,
    policyId: string,
    dto: UpdateLeavePolicyDto,
  ) {
    const policy = await this.prisma.leavePolicy.findFirst({
      where: { id: policyId, companyId },
    });
    if (!policy) {
      throw new NotFoundException('Leave policy not found');
    }

    return this.prisma.leavePolicy.update({
      where: { id: policyId },
      data: dto,
    });
  }

  async deleteLeavePolicy(companyId: string, policyId: string) {
    const policy = await this.prisma.leavePolicy.findFirst({
      where: { id: policyId, companyId },
      include: { allocations: { where: { usedDays: { gt: 0 } } } },
    });

    if (!policy) {
      throw new NotFoundException('Leave policy not found');
    }

    if (policy.allocations.length > 0) {
      throw new BadRequestException(
        'Cannot delete a policy that has already been utilized by employees.',
      );
    }

    await this.prisma.leaveAllocation.deleteMany({
      where: { leavePolicyId: policyId },
    });

    await this.prisma.leavePolicy.delete({
      where: { id: policyId },
    });

    return { success: true };
  }

  // ==========================================
  // EMPLOYEE: Get Available Allocations
  // ==========================================

  async ensureAllocations(employeeId: string, companyId: string) {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // 1. Get all leave policies of the company
    const policies = await this.prisma.leavePolicy.findMany({
      where: { companyId },
    });

    // 2. For each policy, ensure there is an allocation for the current year
    for (const policy of policies) {
      const existing = await this.prisma.leaveAllocation.findFirst({
        where: {
          employeeId,
          leavePolicyId: policy.id,
          year: currentYear,
          periodNumber: 1,
        },
      });

      if (!existing) {
        // Create allocation
        await this.prisma.leaveAllocation.create({
          data: {
            employeeId,
            companyId,
            leavePolicyId: policy.id,
            year: currentYear,
            periodNumber: 1,
            allocatedDays: policy.daysPerYear,
            usedDays: 0,
            expiredDays: 0,
            startDate,
            endDate,
            isExpired: false,
          },
        });
      }
    }
  }

  async getLeaveBalance(employeeId: string, companyId: string) {
    // 1. Ensure allocations exist
    await this.ensureAllocations(employeeId, companyId);

    // 2. Fetch all allocations for the current year
    const today = new Date();
    const allocations = await this.prisma.leaveAllocation.findMany({
      where: {
        employeeId,
        isExpired: false,
        startDate: { lte: today },
        endDate: { gte: today },
      },
      include: { leavePolicy: true },
    });

    const balance: Record<string, number> = {
      casual: 0,
      medical: 0,
      earned: 0,
    };

    for (const alloc of allocations) {
      // Find pending requests for this allocation
      const pendingRequests = await this.prisma.leaveRequest.aggregate({
        where: {
          allocationId: alloc.id,
          status: LeaveStatus.PENDING,
        },
        _sum: { totalDays: true },
      });

      const pendingDays = pendingRequests._sum.totalDays || 0;
      const available =
        alloc.allocatedDays - alloc.usedDays - alloc.expiredDays - pendingDays;

      const typeKey = alloc.leavePolicy.type.toLowerCase();
      balance[typeKey] = Math.max(0, available);
    }

    return balance;
  }

  async getMyAllocations(employeeId: string) {
    const today = new Date();
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { companyId: true },
    });
    if (employee) {
      await this.ensureAllocations(employeeId, employee.companyId);
    }

    return this.prisma.leaveAllocation.findMany({
      where: {
        employeeId,
        isExpired: false,
        startDate: { lte: today },
        endDate: { gte: today },
      },
      include: { leavePolicy: true },
    });
  }

  // ==========================================
  // EMPLOYEE: Apply for Leave
  // ==========================================

  async createLeaveRequest(
    employeeId: string,
    companyId: string,
    dto: CreateLeaveDto,
  ) {
    const start = this.parseValidDate(dto.startDate, 'start');
    const end = this.parseValidDate(dto.endDate, 'end');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Date Validation
    if (start < today) {
      throw new BadRequestException('Leave start date cannot be in the past.');
    }
    if (end < start) {
      throw new BadRequestException('End date cannot be before start date.');
    }

    let totalDays = 0;
    let formattedReason = dto.reason;

    if (dto.isHalfDay) {
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const isWorkDay = await this.calculateWorkingDays(
        start,
        start,
        companyId,
      );
      if (isWorkDay === 0) {
        throw new BadRequestException(
          'Selected date is a non-working day or holiday.',
        );
      }
      totalDays = 0.5;
      const sessionLabel =
        dto.halfDaySession === 'SECOND_HALF' ? 'Second Half' : 'First Half';
      formattedReason = `[Half Day: ${sessionLabel}] ${dto.reason}`;
    } else {
      totalDays = await this.calculateWorkingDays(start, end, companyId);

      if (totalDays === 0) {
        throw new BadRequestException(
          'The selected date range contains only weekends or holidays.',
        );
      }
    }

    // Ensure allocations exist
    await this.ensureAllocations(employeeId, companyId);

    // Transaction to prevent creation race-conditions (Double spending via rapid pending requests)
    const request = await this.prisma.$transaction(async (tx) => {
      const activeAllocation = await tx.leaveAllocation.findFirst({
        where: {
          employeeId,
          isExpired: false,
          startDate: { lte: start },
          endDate: { gte: end },
          leavePolicy: { type: dto.type },
        },
      });

      if (activeAllocation) {
        // Find existing PENDING requests to subtract from true availability
        const pendingRequests = await tx.leaveRequest.aggregate({
          where: {
            allocationId: activeAllocation.id,
            status: LeaveStatus.PENDING,
          },
          _sum: { totalDays: true },
        });

        const pendingDays = pendingRequests._sum.totalDays || 0;
        const available =
          activeAllocation.allocatedDays -
          activeAllocation.usedDays -
          activeAllocation.expiredDays -
          pendingDays;

        if (available < totalDays) {
          throw new BadRequestException(
            `Insufficient leave. Available: ${available} days, Requested: ${totalDays} working days.`,
          );
        }
      } else if (dto.type !== 'UNPAID') {
        throw new BadRequestException(
          `No active allocation found for ${dto.type} in this period.`,
        );
      }

      return tx.leaveRequest.create({
        data: {
          employeeId,
          companyId,
          allocationId: activeAllocation?.id || null,
          type: dto.type,
          startDate: start,
          endDate: end,
          totalDays,
          reason: formattedReason,
          status: LeaveStatus.PENDING,
        },
      });
    });

    await this.auditService.logAction(
      companyId,
      employeeId,
      'CREATE',
      'LeaveRequest',
      request.id,
      null,
      {
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
        totalDays: request.totalDays,
      },
    );

    return request;
  }

  // ==========================================
  // HR/MANAGER: Process Request (The Ledger Transaction)
  // ==========================================

  async updateLeaveStatus(
    companyId: string,
    requestId: string,
    status: LeaveStatus,
    role: string,
    managerId: string,
    rejectionReason?: string,
  ) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'MANAGER', 'OWNER'].includes(role)) {
      throw new ForbiddenException('Access denied');
    }

    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.companyId !== companyId)
      throw new NotFoundException('Request not found');
    if (request.status !== LeaveStatus.PENDING)
      throw new BadRequestException('Already processed');

    let result;
    if (status === LeaveStatus.REJECTED) {
      result = await this.prisma.leaveRequest.update({
        where: { id: requestId },
        data: {
          status,
          managerId,
          rejectionReason: rejectionReason || undefined,
        },
      });
    } else if (status === LeaveStatus.APPROVED) {
      result = await this.prisma.$transaction(async (tx) => {
        const approved = await tx.leaveRequest.update({
          where: { id: requestId },
          data: { status, managerId },
        });

        if (request.allocationId) {
          const allocation = await tx.leaveAllocation.findUnique({
            where: { id: request.allocationId },
          });

          if (!allocation) throw new NotFoundException('Allocation missing');

          const available =
            allocation.allocatedDays -
            allocation.usedDays -
            allocation.expiredDays;

          // Failsafe concurrency check at the exact moment of approval
          if (available < request.totalDays) {
            throw new BadRequestException(
              `Concurrency error: Employee only has ${available} days left.`,
            );
          }

          await tx.leaveAllocation.update({
            where: { id: request.allocationId },
            data: { usedDays: { increment: request.totalDays } },
          });

          await tx.leaveTransaction.create({
            data: {
              employeeId: request.employeeId,
              companyId: request.companyId,
              allocationId: request.allocationId,
              type: TransactionType.LEAVE_USED,
              amount: -Math.abs(request.totalDays),
              description: `Leave Approved: ${request.reason.substring(0, 30)}...`,
            },
          });
        }
        return approved;
      });
    }

    if (result) {
      await this.auditService.logAction(
        companyId,
        managerId,
        status === LeaveStatus.APPROVED ? 'APPROVE' : 'REJECT',
        'LeaveRequest',
        requestId,
        { status: request.status },
        { status: result.status, rejectionReason },
      );
    }

    return result;
  }

  // ==========================================
  // EMPLOYEE: Withdraw / Cancel Leave Request
  // ==========================================
  async withdrawLeaveRequest(
    companyId: string,
    requestId: string,
    employeeId: string,
    userRole: string,
  ) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.companyId !== companyId) {
      throw new NotFoundException('Leave request not found');
    }

    const isPrivileged = ['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole);
    if (request.employeeId !== employeeId && !isPrivileged) {
      throw new ForbiddenException(
        'You are not authorized to withdraw this leave request.',
      );
    }

    if (
      request.status === LeaveStatus.WITHDRAWN ||
      request.status === LeaveStatus.REJECTED
    ) {
      throw new BadRequestException(
        `Leave request is already ${request.status.toLowerCase()}.`,
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If approved, ensure leave is not entirely in the past
    if (request.status === LeaveStatus.APPROVED) {
      if (new Date(request.endDate) < today) {
        throw new BadRequestException(
          'Cannot withdraw a past completed leave.',
        );
      }

      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.leaveRequest.update({
          where: { id: requestId },
          data: { status: LeaveStatus.WITHDRAWN },
        });

        if (request.allocationId) {
          await tx.leaveAllocation.update({
            where: { id: request.allocationId },
            data: { usedDays: { decrement: request.totalDays } },
          });

          await tx.leaveTransaction.create({
            data: {
              employeeId: request.employeeId,
              companyId,
              allocationId: request.allocationId,
              type: TransactionType.LEAVE_REVERSED,
              amount: request.totalDays,
              description: `Leave Withdrawn: Reversal of ${request.totalDays} days`,
            },
          });
        }

        await this.auditService.logAction(
          companyId,
          employeeId,
          'UPDATE',
          'LeaveRequest',
          requestId,
          { status: request.status },
          { status: LeaveStatus.WITHDRAWN },
        );

        return updated;
      });
    }

    // PENDING status: straightforward withdrawal
    const updated = await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: LeaveStatus.WITHDRAWN },
    });

    await this.auditService.logAction(
      companyId,
      employeeId,
      'UPDATE',
      'LeaveRequest',
      requestId,
      { status: request.status },
      { status: LeaveStatus.WITHDRAWN },
    );

    return updated;
  }

  // ==========================================
  // EMPLOYEE/HR: GET HISTORY & APPROVALS
  // ==========================================

  async getMyLeaves(employeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApprovals(companyId: string, user: { sub: string; role: string }) {
    const isManager = user.role === 'MANAGER';
    let filter: any = { companyId, status: LeaveStatus.PENDING };

    if (isManager) {
      // Find employees reporting to this manager
      const directReports = await this.prisma.employee.findMany({
        where: { companyId, reportingManagerId: user.sub },
        select: { id: true },
      });
      const reportIds = directReports.map((e) => e.id);

      if (reportIds.length > 0) {
        filter = {
          companyId,
          status: LeaveStatus.PENDING,
          employeeId: { in: reportIds },
        };
      }
    }

    return this.prisma.leaveRequest.findMany({
      where: filter,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllCompanyLeaves(
    companyId: string,
    query?: { status?: LeaveStatus },
  ) {
    return this.prisma.leaveRequest.findMany({
      where: {
        companyId,
        ...(query?.status ? { status: query.status } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            email: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // HR: MANUAL BALANCE ADJUSTMENT / COMP-OFF
  // ==========================================
  async adjustLeaveBalance(
    companyId: string,
    dto: AdjustLeaveBalanceDto,
    actorId?: string,
  ) {
    await this.ensureAllocations(dto.employeeId, companyId);

    const targetYear = dto.year || new Date().getFullYear();
    const allocation = await this.prisma.leaveAllocation.findFirst({
      where: {
        employeeId: dto.employeeId,
        companyId,
        year: targetYear,
        leavePolicy: { type: dto.type },
      },
    });

    if (!allocation) {
      throw new NotFoundException(
        `No allocation found for employee for ${dto.type} in year ${targetYear}.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedAlloc = await tx.leaveAllocation.update({
        where: { id: allocation.id },
        data: {
          allocatedDays: { increment: dto.amount },
        },
      });

      await tx.leaveTransaction.create({
        data: {
          employeeId: dto.employeeId,
          companyId,
          allocationId: allocation.id,
          type: TransactionType.ADJUSTMENT,
          amount: dto.amount,
          description: dto.reason,
        },
      });

      return updatedAlloc;
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'LeaveAllocation',
      allocation.id,
      { allocatedDays: allocation.allocatedDays },
      {
        allocatedDays: updated.allocatedDays,
        adjustment: dto.amount,
        reason: dto.reason,
      },
    );

    return updated;
  }

  // ==========================================
  // HR: HOLIDAY MANAGEMENT
  // ==========================================

  async getHolidays(companyId: string) {
    return this.prisma.holiday.findMany({
      where: { companyId },
      orderBy: { date: 'asc' },
    });
  }

  async addHoliday(
    companyId: string,
    data: { name: string; date: string; type?: string },
    actorId?: string,
  ) {
    const holiday = await this.prisma.holiday.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        type: data.type || 'NATIONAL',
        companyId,
      },
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'CREATE',
      'Holiday',
      holiday.id,
      null,
      { name: holiday.name, date: holiday.date, type: holiday.type },
    );

    return holiday;
  }

  async removeHoliday(companyId: string, id: string, actorId?: string) {
    const holiday = await this.prisma.holiday.findFirst({
      where: { id, companyId },
    });

    // Safest way to delete by composite matching when not explicitly defined as a unique compound index
    const result = await this.prisma.holiday.deleteMany({
      where: {
        id: id,
        companyId: companyId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Holiday not found or you are not authorized to delete it.',
      );
    }

    if (holiday) {
      await this.auditService.logAction(
        companyId,
        actorId || null,
        'DELETE',
        'Holiday',
        id,
        { name: holiday.name, date: holiday.date, type: holiday.type },
        null,
      );
    }

    return { success: true };
  }

  async getAllCompanyLeaveBalances(companyId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        email: true,
      },
    });

    const results: any[] = [];
    for (const emp of employees) {
      const balance = await this.getLeaveBalance(emp.id, companyId);
      results.push({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeCode: emp.employeeCode,
        email: emp.email,
        balance,
      });
    }
    return results;
  }

  // ==========================================
  // YEAR-END CARRY-FORWARD & LAPSE ENGINE
  // ==========================================
  async processYearEndCarryForward(
    companyId: string,
    fromYear: number,
    toYear: number,
    actorId?: string,
  ) {
    const allocations = await this.prisma.leaveAllocation.findMany({
      where: { companyId, year: fromYear, isExpired: false },
      include: { leavePolicy: true },
    });

    let carriedForwardCount = 0;
    let lapsedCount = 0;

    for (const alloc of allocations) {
      const remaining = Math.max(0, alloc.allocatedDays - alloc.usedDays);
      if (remaining <= 0) {
        await this.prisma.leaveAllocation.update({
          where: { id: alloc.id },
          data: { isExpired: true },
        });
        continue;
      }

      if (alloc.leavePolicy.carryForward) {
        const maxCarry = alloc.leavePolicy.daysPerYear;
        const carryDays = Math.min(remaining, maxCarry);
        const expiredDays = Math.max(0, remaining - carryDays);

        let nextAlloc = await this.prisma.leaveAllocation.findFirst({
          where: {
            employeeId: alloc.employeeId,
            companyId,
            leavePolicyId: alloc.leavePolicyId,
            year: toYear,
          },
        });

        if (!nextAlloc) {
          nextAlloc = await this.prisma.leaveAllocation.create({
            data: {
              employeeId: alloc.employeeId,
              companyId,
              leavePolicyId: alloc.leavePolicyId,
              year: toYear,
              periodNumber: 1,
              allocatedDays: alloc.leavePolicy.daysPerYear + carryDays,
              startDate: new Date(toYear, 0, 1),
              endDate: new Date(toYear, 11, 31),
            },
          });
        } else {
          await this.prisma.leaveAllocation.update({
            where: { id: nextAlloc.id },
            data: { allocatedDays: { increment: carryDays } },
          });
        }

        await this.prisma.leaveTransaction.create({
          data: {
            employeeId: alloc.employeeId,
            companyId,
            allocationId: nextAlloc.id,
            type: TransactionType.ADJUSTMENT,
            amount: carryDays,
            description:
              'Carried forward from ' + fromYear + ' (' + carryDays + ' days)',
          },
        });

        if (expiredDays > 0) {
          await this.prisma.leaveTransaction.create({
            data: {
              employeeId: alloc.employeeId,
              companyId,
              allocationId: alloc.id,
              type: TransactionType.EXPIRY,
              amount: -expiredDays,
              description:
                'Expired beyond carry-forward limit from ' + fromYear,
            },
          });
        }

        await this.prisma.leaveAllocation.update({
          where: { id: alloc.id },
          data: { isExpired: true, expiredDays },
        });

        carriedForwardCount++;
      } else {
        await this.prisma.leaveTransaction.create({
          data: {
            employeeId: alloc.employeeId,
            companyId,
            allocationId: alloc.id,
            type: TransactionType.EXPIRY,
            amount: -remaining,
            description: 'Year-end lapse for ' + fromYear,
          },
        });

        await this.prisma.leaveAllocation.update({
          where: { id: alloc.id },
          data: { isExpired: true, expiredDays: remaining },
        });

        lapsedCount++;
      }
    }

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'LeaveAllocation',
      fromYear + '->' + toYear,
      null,
      { carriedForwardCount, lapsedCount },
    );

    return {
      success: true,
      fromYear,
      toYear,
      processedAllocations: allocations.length,
      carriedForwardCount,
      lapsedCount,
    };
  }
}
