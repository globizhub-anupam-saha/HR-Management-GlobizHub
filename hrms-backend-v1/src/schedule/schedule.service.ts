import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  BulkAssignScheduleDto,
  ApplyRotationPatternDto,
  QueryRosterMatrixDto,
} from './dto/schedule-operations.dto';

export interface ShiftComplianceConflict {
  employeeId: string;
  employeeName?: string;
  date: string;
  type: 'REST_PERIOD_VIOLATION' | 'MAX_CONSECUTIVE_DAYS_VIOLATION';
  message: string;
  severity: 'WARNING' | 'ERROR';
}

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // 1. Get schedule for the logged-in employee (Upcoming 7 days)
  async getMySchedule(employeeId: string, companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const schedules = await this.prisma.schedule.findMany({
      where: {
        employeeId,
        companyId,
        date: { gte: today, lte: nextWeek },
      },
      include: {
        shift: true,
      },
      orderBy: { date: 'asc' },
    });

    const overrides = await this.prisma.shiftAssignmentOverride.findMany({
      where: {
        employeeId,
        companyId,
        date: { gte: today, lte: nextWeek },
        status: 'ACTIVE',
      },
      include: {
        overrideShift: true,
        relatedSwapRequest: {
          include: {
            requester: {
              select: { id: true, firstName: true, lastName: true },
            },
            target: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    return schedules.map((schedule) => {
      const override = overrides.find(
        (o) => o.date.toDateString() === schedule.date.toDateString(),
      );
      if (override) {
        return {
          ...schedule,
          isOverride: true,
          originalShift: schedule.shift,
          isDayOff:
            override.overrideShiftId === null ? true : schedule.isDayOff,
          shift: override.overrideShift,
          overrideSource: override.source,
          relatedSwapRequest: override.relatedSwapRequest,
        };
      }
      return schedule;
    });
  }

  // 2. Admin/Manager: Create a new Shift Template
  async createShift(
    companyId: string,
    dto: any,
    userRole: string,
    actorId?: string,
  ) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole)) {
      throw new ForbiddenException(
        'Only Admins and HR Heads can create shift templates.',
      );
    }
    const shift = await this.prisma.shift.create({
      data: { ...dto, companyId },
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'CREATE',
      'Shift',
      shift.id,
      null,
      { name: shift.name, startTime: shift.startTime, endTime: shift.endTime },
    );

    return shift;
  }

  // 3. Get all Shift Templates for the Company
  async getShifts(companyId: string) {
    return this.prisma.shift.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. Admin/Manager: Update a Shift Template
  async updateShift(
    shiftId: string,
    companyId: string,
    dto: any,
    userRole: string,
    actorId?: string,
  ) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole)) {
      throw new ForbiddenException(
        'Only Admins and HR Heads can edit shift templates.',
      );
    }

    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, companyId },
    });
    if (!shift)
      throw new NotFoundException('Shift not found in your organization.');

    const updated = await this.prisma.shift.update({
      where: { id: shiftId },
      data: dto,
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'Shift',
      shiftId,
      { name: shift.name, startTime: shift.startTime, endTime: shift.endTime },
      {
        name: updated.name,
        startTime: updated.startTime,
        endTime: updated.endTime,
      },
    );

    return updated;
  }

  // 5. Admin: Delete a Shift Template
  async deleteShift(
    shiftId: string,
    companyId: string,
    userRole: string,
    actorId?: string,
  ) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole)) {
      throw new ForbiddenException('Only Admins can delete shifts.');
    }

    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, companyId },
    });
    if (!shift)
      throw new NotFoundException('Shift not found in your organization.');

    const deleted = await this.prisma.shift.delete({
      where: { id: shiftId },
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'DELETE',
      'Shift',
      shiftId,
      { name: shift.name, startTime: shift.startTime, endTime: shift.endTime },
      null,
    );

    return deleted;
  }

  // ========================================================
  // ENTERPRISE SAAS: RBAC MANAGER SCOPING HELPER
  // ========================================================
  private async assertManagerScope(
    companyId: string,
    actorId: string,
    userRole: string,
    targetEmployeeIds: string[],
  ): Promise<void> {
    if (['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole)) {
      return; // Full organization access
    }

    if (userRole === 'MANAGER') {
      const manager = await this.prisma.employee.findUnique({
        where: { id: actorId },
        select: {
          id: true,
          departmentId: true,
          directReports: { select: { id: true } },
        },
      });

      if (!manager) {
        throw new ForbiddenException(
          'Manager profile not found in organization.',
        );
      }

      const directReportSet = new Set(manager.directReports.map((d) => d.id));

      const employees = await this.prisma.employee.findMany({
        where: { id: { in: targetEmployeeIds }, companyId },
        select: {
          id: true,
          departmentId: true,
          firstName: true,
          lastName: true,
        },
      });

      for (const emp of employees) {
        const isDirect = directReportSet.has(emp.id);
        const isSameDept =
          manager.departmentId && emp.departmentId === manager.departmentId;
        if (!isDirect && !isSameDept) {
          throw new ForbiddenException(
            `You only have permission to manage shifts for employees in your department or direct reports. Access denied for ${emp.firstName} ${emp.lastName}.`,
          );
        }
      }
      return;
    }

    throw new ForbiddenException(
      'You do not have permission to schedule or assign shifts.',
    );
  }

  // ========================================================
  // ENTERPRISE SAAS: LABOR COMPLIANCE & REST-PERIOD AUDIT
  // ========================================================
  /**
   * Validates statutory rest rules:
   * 1. 11-Hour Minimum Rest Period between shifts (Factories Act / EU Directive).
   * 2. Max 6 Consecutive Working Days without a statutory weekly rest day.
   */
  async validateShiftCompliance(
    companyId: string,
    employeeId: string,
    date: Date,
    targetShift: any | null,
    isDayOff: boolean,
  ): Promise<ShiftComplianceConflict[]> {
    const conflicts: ShiftComplianceConflict[] = [];
    const dateStr = date.toISOString().split('T')[0];

    // If day off, rest period violation won't occur on this day
    if (isDayOff || !targetShift) {
      return conflicts;
    }

    const [tHours, tMinutes] = (targetShift.startTime || '09:00')
      .split(':')
      .map(Number);
    const targetStart = new Date(date);
    targetStart.setUTCHours(tHours, tMinutes, 0, 0);

    // 1. Check Previous Day Shift (Did it end less than 11 hours before targetStart?)
    const prevDate = new Date(date);
    prevDate.setUTCDate(prevDate.getUTCDate() - 1);
    prevDate.setUTCHours(0, 0, 0, 0);

    const prevSchedule = await this.prisma.schedule.findFirst({
      where: { employeeId, companyId, date: prevDate },
      include: { shift: true },
    });

    if (prevSchedule && !prevSchedule.isDayOff && prevSchedule.shift) {
      const [pEndH, pEndM] = (prevSchedule.shift.endTime || '17:00')
        .split(':')
        .map(Number);
      const prevEnd = new Date(prevDate);

      // If previous shift was a night shift or cross-midnight
      if (
        prevSchedule.shift.isNightShift ||
        pEndH < Number(prevSchedule.shift.startTime.split(':')[0])
      ) {
        // Ends on current date morning
        prevEnd.setUTCDate(prevEnd.getUTCDate() + 1);
      }
      prevEnd.setUTCHours(pEndH, pEndM, 0, 0);

      const restHours =
        (targetStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60);

      if (restHours < 11 && restHours >= 0) {
        conflicts.push({
          employeeId,
          date: dateStr,
          type: 'REST_PERIOD_VIOLATION',
          message: `Rest period after ${prevSchedule.shift.name} (${prevSchedule.shift.endTime}) is only ${restHours.toFixed(1)} hours (minimum 11h required by statutory standards).`,
          severity: 'WARNING',
        });
      }
    }

    // 2. Check Consecutive Working Days (Max 6 consecutive working days without a Day Off)
    const weekStart = new Date(date);
    weekStart.setUTCDate(weekStart.getUTCDate() - 6);
    weekStart.setUTCHours(0, 0, 0, 0);

    const pastSchedules = await this.prisma.schedule.findMany({
      where: {
        employeeId,
        companyId,
        date: { gte: weekStart, lt: date },
      },
      orderBy: { date: 'desc' },
    });

    let consecutiveDays = 1; // including today
    for (const s of pastSchedules) {
      if (s.isDayOff || !s.shiftId) {
        break;
      }
      consecutiveDays++;
    }

    if (consecutiveDays > 6) {
      conflicts.push({
        employeeId,
        date: dateStr,
        type: 'MAX_CONSECUTIVE_DAYS_VIOLATION',
        message: `Employee is scheduled for ${consecutiveDays} consecutive working days without a statutory weekly rest day.`,
        severity: 'WARNING',
      });
    }

    return conflicts;
  }

  // 6. Assign Schedule to an Employee (Enhanced with Manager Scope & Compliance)
  async assignSchedule(
    companyId: string,
    dto: any,
    userRole: string,
    actorId?: string,
  ) {
    await this.assertManagerScope(companyId, actorId || '', userRole, [
      dto.employeeId,
    ]);

    const targetDate = new Date(dto.date);
    targetDate.setUTCHours(0, 0, 0, 0);

    let targetShift: any = null;
    if (dto.shiftId && !dto.isDayOff) {
      targetShift = await this.prisma.shift.findUnique({
        where: { id: dto.shiftId },
      });
    }

    // Compliance Check
    const conflicts = await this.validateShiftCompliance(
      companyId,
      dto.employeeId,
      targetDate,
      targetShift,
      dto.isDayOff || false,
    );

    if (conflicts.length > 0 && !dto.overrideConflict) {
      return {
        success: false,
        requiresOverride: true,
        conflicts,
        message:
          'Statutory compliance conflicts detected. Pass overrideConflict: true with justification to proceed.',
      };
    }

    const schedule = await this.prisma.schedule.upsert({
      where: {
        employeeId_date: {
          employeeId: dto.employeeId,
          date: targetDate,
        },
      },
      update: {
        shiftId: dto.shiftId || null,
        isDayOff: dto.isDayOff || false,
      },
      create: {
        employeeId: dto.employeeId,
        companyId,
        shiftId: dto.shiftId || null,
        date: targetDate,
        isDayOff: dto.isDayOff || false,
      },
    });

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'UPDATE',
      'Schedule',
      schedule.id,
      null,
      {
        employeeId: dto.employeeId,
        date: dto.date,
        shiftId: dto.shiftId,
        isDayOff: dto.isDayOff,
        conflictsOverridden: conflicts.length > 0 ? conflicts : undefined,
      },
    );

    return {
      success: true,
      schedule,
      conflicts,
    };
  }

  // ========================================================
  // ENTERPRISE SAAS: BULK ROSTER ASSIGNMENT
  // ========================================================
  async bulkAssignSchedule(
    companyId: string,
    dto: BulkAssignScheduleDto,
    userRole: string,
    actorId?: string,
  ) {
    // 1. Resolve Target Employee IDs
    let targetEmployeeIds = dto.employeeIds || [];
    if (dto.departmentId) {
      const deptEmployees = await this.prisma.employee.findMany({
        where: {
          companyId,
          departmentId: dto.departmentId,
          employmentStatus: 'ACTIVE',
        },
        select: { id: true },
      });
      targetEmployeeIds = Array.from(
        new Set([...targetEmployeeIds, ...deptEmployees.map((e) => e.id)]),
      );
    }

    if (targetEmployeeIds.length === 0) {
      throw new BadRequestException(
        'No active employees selected for bulk assignment.',
      );
    }

    // 2. Assert Manager Scope
    await this.assertManagerScope(
      companyId,
      actorId || '',
      userRole,
      targetEmployeeIds,
    );

    const start = new Date(dto.startDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(dto.endDate);
    end.setUTCHours(0, 0, 0, 0);

    if (start > end) {
      throw new BadRequestException('Start date cannot be after end date.');
    }

    const shift = dto.shiftId
      ? await this.prisma.shift.findUnique({ where: { id: dto.shiftId } })
      : null;

    const allConflicts: ShiftComplianceConflict[] = [];
    const schedulesToUpsert: Array<{
      employeeId: string;
      date: Date;
      shiftId: string | null;
      isDayOff: boolean;
    }> = [];

    // 3. Generate candidate records across date range
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getUTCDay();

      // Check daysOfWeek filter (e.g. only Mon-Fri or weekends)
      if (!dto.daysOfWeek || dto.daysOfWeek.includes(dayOfWeek)) {
        for (const empId of targetEmployeeIds) {
          const shiftDate = new Date(current);

          const conflicts = await this.validateShiftCompliance(
            companyId,
            empId,
            shiftDate,
            shift,
            dto.isDayOff || false,
          );

          if (conflicts.length > 0) {
            allConflicts.push(...conflicts);
          }

          schedulesToUpsert.push({
            employeeId: empId,
            date: shiftDate,
            shiftId: dto.isDayOff ? null : dto.shiftId || null,
            isDayOff: dto.isDayOff || false,
          });
        }
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    // 4. Return conflicts for manager review if not overridden
    if (allConflicts.length > 0 && !dto.overrideConflict) {
      return {
        success: false,
        requiresOverride: true,
        totalConflicts: allConflicts.length,
        conflicts: allConflicts.slice(0, 50),
        message: `${allConflicts.length} rest-period or consecutive-day conflicts detected. Pass overrideConflict: true to enforce schedule.`,
      };
    }

    // 5. Execute Upserts
    let upsertedCount = 0;
    for (const item of schedulesToUpsert) {
      await this.prisma.schedule.upsert({
        where: {
          employeeId_date: {
            employeeId: item.employeeId,
            date: item.date,
          },
        },
        update: {
          shiftId: item.shiftId,
          isDayOff: item.isDayOff,
        },
        create: {
          companyId,
          employeeId: item.employeeId,
          date: item.date,
          shiftId: item.shiftId,
          isDayOff: item.isDayOff,
        },
      });
      upsertedCount++;
    }

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'CREATE',
      'Schedule',
      'BULK_ROSTER',
      null,
      {
        totalAssigned: upsertedCount,
        employees: targetEmployeeIds.length,
        startDate: dto.startDate,
        endDate: dto.endDate,
        conflictsOverridden: allConflicts.length,
      },
    );

    return {
      success: true,
      totalAssigned: upsertedCount,
      employeeCount: targetEmployeeIds.length,
      startDate: dto.startDate,
      endDate: dto.endDate,
      conflictsOverridden: allConflicts.length,
    };
  }

  // ========================================================
  // ENTERPRISE SAAS: RECURRING ROTATIONAL SHIFT PATTERNS
  // ========================================================
  async applyRotationPattern(
    companyId: string,
    dto: ApplyRotationPatternDto,
    userRole: string,
    actorId?: string,
  ) {
    if (!dto.pattern || dto.pattern.length === 0) {
      throw new BadRequestException(
        'A rotation pattern array must contain at least one step.',
      );
    }
    if (!dto.employeeIds || dto.employeeIds.length === 0) {
      throw new BadRequestException(
        'Select at least one employee for the rotational pattern.',
      );
    }

    await this.assertManagerScope(
      companyId,
      actorId || '',
      userRole,
      dto.employeeIds,
    );

    const startDate = new Date(dto.startDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const patternLength = dto.pattern.length;
    const totalDays = patternLength * dto.cycles;

    const allConflicts: ShiftComplianceConflict[] = [];
    const assignments: Array<{
      employeeId: string;
      date: Date;
      shiftId: string | null;
      isDayOff: boolean;
    }> = [];

    // Preload shifts for quick compliance checking
    const shiftsMap = new Map<string, any>();
    const shiftIds = dto.pattern
      .map((p) => p.shiftId)
      .filter(Boolean) as string[];
    if (shiftIds.length > 0) {
      const shifts = await this.prisma.shift.findMany({
        where: { id: { in: shiftIds }, companyId },
      });
      for (const s of shifts) {
        shiftsMap.set(s.id, s);
      }
    }

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const shiftDate = new Date(startDate);
      shiftDate.setUTCDate(shiftDate.getUTCDate() + dayOffset);

      const step = dto.pattern[dayOffset % patternLength];
      const targetShift = step.shiftId
        ? shiftsMap.get(step.shiftId) || null
        : null;
      const isDayOff = step.isDayOff || !step.shiftId;

      for (const empId of dto.employeeIds) {
        const conflicts = await this.validateShiftCompliance(
          companyId,
          empId,
          shiftDate,
          targetShift,
          isDayOff,
        );
        if (conflicts.length > 0) {
          allConflicts.push(...conflicts);
        }

        assignments.push({
          employeeId: empId,
          date: shiftDate,
          shiftId: isDayOff ? null : step.shiftId || null,
          isDayOff,
        });
      }
    }

    if (allConflicts.length > 0 && !dto.overrideConflict) {
      return {
        success: false,
        requiresOverride: true,
        totalConflicts: allConflicts.length,
        conflicts: allConflicts.slice(0, 50),
        message: `${allConflicts.length} rest-period or consecutive-day conflicts detected in the rotation pattern. Review conflicts or pass overrideConflict: true to proceed.`,
      };
    }

    let assignedCount = 0;
    for (const a of assignments) {
      await this.prisma.schedule.upsert({
        where: {
          employeeId_date: {
            employeeId: a.employeeId,
            date: a.date,
          },
        },
        update: {
          shiftId: a.shiftId,
          isDayOff: a.isDayOff,
        },
        create: {
          companyId,
          employeeId: a.employeeId,
          date: a.date,
          shiftId: a.shiftId,
          isDayOff: a.isDayOff,
        },
      });
      assignedCount++;
    }

    await this.auditService.logAction(
      companyId,
      actorId || null,
      'CREATE',
      'Schedule',
      'ROTATIONAL_ROSTER',
      null,
      {
        cycles: dto.cycles,
        patternLength,
        totalAssigned: assignedCount,
        employees: dto.employeeIds.length,
        startDate: dto.startDate,
      },
    );

    return {
      success: true,
      totalAssigned: assignedCount,
      cycles: dto.cycles,
      patternLength,
      employeesCount: dto.employeeIds.length,
      conflictsOverridden: allConflicts.length,
    };
  }

  // ========================================================
  // ENTERPRISE SAAS: ROSTER MATRIX GRID API
  // ========================================================
  async getRosterMatrix(
    companyId: string,
    actorId: string,
    userRole: string,
    query: QueryRosterMatrixDto,
  ) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const start = query.startDate ? new Date(query.startDate) : new Date(today);
    start.setUTCHours(0, 0, 0, 0);

    const end = query.endDate ? new Date(query.endDate) : new Date(start);
    if (!query.endDate) {
      end.setUTCDate(start.getUTCDate() + 6); // 7-day default
    }
    end.setUTCHours(0, 0, 0, 0);

    // Manager Scoping: if manager, restrict to their department/direct reports
    let deptFilter: any = query.departmentId
      ? { departmentId: query.departmentId }
      : {};
    if (userRole === 'MANAGER') {
      const manager = await this.prisma.employee.findUnique({
        where: { id: actorId },
        select: { departmentId: true, directReports: { select: { id: true } } },
      });
      const directReportIds = manager?.directReports.map((d) => d.id) || [];
      deptFilter = {
        OR: [
          ...(manager?.departmentId
            ? [{ departmentId: manager.departmentId }]
            : []),
          { id: { in: directReportIds } },
        ],
      };
    }

    // 1. Fetch Employees
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        employmentStatus: 'ACTIVE',
        ...deptFilter,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true } },
      },
      orderBy: [{ department: { name: 'asc' } }, { employeeCode: 'asc' }],
    });

    // 2. Fetch All Shift Templates
    const shifts = await this.prisma.shift.findMany({
      where: { companyId },
      orderBy: { startTime: 'asc' },
    });

    // 3. Fetch Schedules in window
    const schedules = await this.prisma.schedule.findMany({
      where: {
        companyId,
        employeeId: { in: employees.map((e) => e.id) },
        date: { gte: start, lte: end },
      },
      include: { shift: true },
    });

    // 4. Fetch Overrides (Swaps/Proxies) in window
    const overrides = await this.prisma.shiftAssignmentOverride.findMany({
      where: {
        companyId,
        employeeId: { in: employees.map((e) => e.id) },
        date: { gte: start, lte: end },
        status: 'ACTIVE',
      },
      include: { overrideShift: true },
    });

    // Build Day Column list
    const days: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      days.push(cur.toISOString().split('T')[0]);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    // Build Map for fast matrix lookups
    const scheduleMap = new Map<string, any>();
    for (const s of schedules) {
      const dateKey = s.date.toISOString().split('T')[0];
      scheduleMap.set(`${s.employeeId}_${dateKey}`, s);
    }

    const overrideMap = new Map<string, any>();
    for (const o of overrides) {
      const dateKey = o.date.toISOString().split('T')[0];
      overrideMap.set(`${o.employeeId}_${dateKey}`, o);
    }

    // Compose Matrix Rows
    const matrix = employees.map((emp) => {
      const rowDays: Record<string, any> = {};

      for (const d of days) {
        const key = `${emp.id}_${d}`;
        const override = overrideMap.get(key);
        const sched = scheduleMap.get(key);

        if (override) {
          rowDays[d] = {
            isOverride: true,
            isDayOff: override.overrideShiftId === null,
            shiftId: override.overrideShiftId,
            shiftName: override.overrideShift?.name || 'Day Off (Given Away)',
            startTime: override.overrideShift?.startTime || null,
            endTime: override.overrideShift?.endTime || null,
            isNightShift: override.overrideShift?.isNightShift || false,
            source: override.source,
          };
        } else if (sched) {
          rowDays[d] = {
            isOverride: false,
            isDayOff: sched.isDayOff || !sched.shiftId,
            shiftId: sched.shiftId,
            shiftName: sched.isDayOff
              ? 'Day Off'
              : sched.shift?.name || 'Unassigned',
            startTime: sched.shift?.startTime || null,
            endTime: sched.shift?.endTime || null,
            isNightShift: sched.shift?.isNightShift || false,
          };
        } else {
          rowDays[d] = {
            isOverride: false,
            isDayOff: false,
            shiftId: null,
            shiftName: 'Unassigned',
            startTime: null,
            endTime: null,
            isNightShift: false,
          };
        }
      }

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`.trim(),
        employeeCode: emp.employeeCode,
        department: emp.department?.name || 'General',
        designation: emp.designation?.name || 'Staff',
        days: rowDays,
      };
    });

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      days,
      shifts,
      matrix,
      totalEmployees: employees.length,
    };
  }

  // 7. Get an employee's schedule on a specific date (for Shift Swap helper)
  async getEmployeeScheduleOnDate(
    employeeId: string,
    dateStr: string,
    companyId: string,
  ) {
    const queryDate = new Date(dateStr);
    queryDate.setUTCHours(0, 0, 0, 0);
    return this.prisma.schedule.findFirst({
      where: {
        employeeId,
        companyId,
        date: queryDate,
      },
      include: {
        shift: true,
      },
    });
  }
}
