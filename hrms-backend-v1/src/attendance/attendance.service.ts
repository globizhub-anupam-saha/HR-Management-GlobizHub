import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // The Haversine Formula to calculate distance in meters
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in meters

    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Calculates the exact UTC date range for a calendar day in the tenant's configured timezone.
   */
  getTenantDayBounds(
    timeZone: string = 'UTC',
    refDate: Date = new Date(),
  ): { startOfDay: Date; endOfDay: Date } {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timeZone || 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const dateStr = formatter.format(refDate);
      const [year, month, day] = dateStr.split('-').map(Number);
      const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone || 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(utcMidnight);

      const tzH = Number(parts.find((p) => p.type === 'hour')?.value || 0);
      const tzM = Number(parts.find((p) => p.type === 'minute')?.value || 0);

      let offsetHours = tzH;
      if (offsetHours > 12) offsetHours -= 24;
      const offsetMs = (offsetHours * 60 + tzM) * 60 * 1000;

      const startOfDay = new Date(utcMidnight.getTime() - offsetMs);
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
      return { startOfDay, endOfDay };
    } catch {
      const startOfDay = new Date(refDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999);
      return { startOfDay, endOfDay };
    }
  }

  async getCompanyTimeZone(companyId: string): Promise<string> {
    try {
      const settings = await this.prisma.companySettings.findUnique({
        where: { companyId },
        select: { timeZone: true },
      });
      return settings?.timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }

  async clockIn(
    employeeId: string,
    companyId: string,
    dto: ClockInDto,
    userIp: string,
  ) {
    const now = new Date();

    // 1. Fetch Company Settings & Tenant Timezone
    const settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });

    if (!settings) {
      throw new BadRequestException('Company settings not configured.');
    }

    const { startOfDay: today, endOfDay } = this.getTenantDayBounds(
      settings.timeZone || 'UTC',
      now,
    );

    // 1b. Check for any unclosed clock-in session across the last 28 hours (including cross-midnight shifts)
    const twentyEightHoursAgo = new Date(Date.now() - 28 * 60 * 60 * 1000);
    const unclosedRecord = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        companyId,
        checkOutTime: null,
        createdAt: { gte: twentyEightHoursAgo },
      },
    });

    if (unclosedRecord) {
      throw new BadRequestException(
        'You are already clocked in. Please clock out first before starting a new session.',
      );
    }

    let isVerified = false;
    let verificationMethod = 'NONE';

    // 3. Verification Method A: Geolocation
    if (
      settings.enableGps &&
      settings.officeLatitude &&
      settings.officeLongitude &&
      dto.latitude &&
      dto.longitude
    ) {
      const distanceMeters = this.calculateDistance(
        settings.officeLatitude,
        settings.officeLongitude,
        dto.latitude,
        dto.longitude,
      );

      if (distanceMeters <= settings.allowedRadiusMeters) {
        isVerified = true;
        verificationMethod = 'GPS';
      }
    }

    // 4. Verification Method B: Network IP/WiFi
    if (!isVerified && settings.isIpRestrictionOn && settings.officeIpAddress) {
      if (userIp.includes(settings.officeIpAddress)) {
        isVerified = true;
        verificationMethod = 'WIFI_IP';
      }
    }

    // 5. If no restriction is configured, allow manual clock-in
    const isGpsConfigured =
      settings.enableGps &&
      settings.officeLatitude !== null &&
      settings.officeLongitude !== null;

    const isIpConfigured =
      settings.isIpRestrictionOn &&
      settings.officeIpAddress !== null &&
      settings.officeIpAddress !== '';

    if (!isGpsConfigured && !isIpConfigured) {
      isVerified = true;
      verificationMethod = 'MANUAL';
    }

    if (!isVerified) {
      throw new UnauthorizedException(
        'Attendance Denied: You must be at the office location or connected to the Office Wi-Fi to clock in.',
      );
    }

    // Check for shift assignment overrides for today
    const override = await this.prisma.shiftAssignmentOverride.findFirst({
      where: {
        employeeId,
        date: today,
        status: 'ACTIVE',
      },
    });

    if (override && override.overrideShiftId === null) {
      throw new BadRequestException(
        'Attendance Denied: You have given this shift away (Shift Transfer / Proxy).',
      );
    }

    let shiftId = override?.overrideShiftId || null;
    const shiftSwapRequestId = override?.relatedSwapRequestId || null;

    // Fall back to standard scheduled shift if no override exists
    if (!shiftId) {
      const schedule = await this.prisma.schedule.findFirst({
        where: { employeeId, date: today },
      });
      shiftId = schedule?.shiftId || null;
    }

    // Fetch Shift Details to evaluate Night Shift & Multi-Punch rules
    let shift: any = null;
    if (shiftId) {
      shift = await this.prisma.shift.findUnique({
        where: { id: shiftId },
      });
    }

    let isNightShift = shift?.isNightShift ?? false;
    if (shift?.startTime && shift?.endTime) {
      const [startH] = shift.startTime.split(':').map(Number);
      const [endH] = shift.endTime.split(':').map(Number);
      if (endH < startH) {
        isNightShift = true;
      }
    }

    // Evaluate multi-punch permission:
    // IT company 9-to-5 policy has allowMultiPunch = false (default).
    // Hospital / split shifts have allowMultiPunch = true on company or shift.
    const isMultiPunchAllowed =
      (settings as any).allowMultiPunch === true ||
      shift?.allowMultiPunch === true ||
      shift?.isSplitShift === true;

    // 6. Check if an attendance record already exists for today
    const existingRecord = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        companyId,
        date: {
          gte: today,
          lte: endOfDay,
        },
      },
      include: {
        sessions: true,
      },
    });

    if (existingRecord) {
      // If employee already completed attendance today and multi-punch is NOT allowed (e.g., IT 9-5 fixed schedule)
      if (!isMultiPunchAllowed) {
        throw new BadRequestException(
          'You have already completed your attendance for today.',
        );
      }

      // Multi-punch IS allowed (Hospital / Split shift / Emergency call-back):
      // Add a new session to the existing day's attendance record
      const sessionCount = await this.prisma.attendanceSession.count({
        where: { attendanceId: existingRecord.id },
      });
      const newSessionIndex = sessionCount + 1;

      const newSession = await this.prisma.attendanceSession.create({
        data: {
          attendanceId: existingRecord.id,
          sessionIndex: newSessionIndex,
          checkInTime: now,
          verificationMethod,
        },
      });

      const updatedAttendance = await this.prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkOutTime: null, // Open new active session
          status: 'PRESENT',
        },
        include: {
          sessions: {
            orderBy: { sessionIndex: 'asc' },
          },
        },
      });

      return {
        message: `Successfully clocked in for session #${newSessionIndex} via ${verificationMethod}`,
        attendance: updatedAttendance,
        session: newSession,
      };
    }

    // 7. First clock-in of the day: create attendance record and session #1
    const attendance = await this.prisma.attendance.create({
      data: {
        employeeId,
        companyId,
        date: today,
        shiftDate: today,
        checkInTime: now,
        status: 'PRESENT',
        verificationMethod,
        shiftId,
        shiftSwapRequestId,
        isCrossMidnight: isNightShift,
      },
    });

    const firstSession = await this.prisma.attendanceSession.create({
      data: {
        attendanceId: attendance.id,
        sessionIndex: 1,
        checkInTime: now,
        verificationMethod,
      },
    });

    return {
      message: `Successfully clocked in via ${verificationMethod}`,
      attendance,
      session: firstSession,
    };
  }

  async clockOut(employeeId: string, companyId: string) {
    const now = new Date();
    // Search within 28 hours to cover cross-midnight night shifts (e.g., 20:00 yesterday to 08:00 today)
    const twentyEightHoursAgo = new Date(Date.now() - 28 * 60 * 60 * 1000);

    const record = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        companyId,
        checkOutTime: null,
        createdAt: {
          gte: twentyEightHoursAgo,
        },
      },
      include: {
        shift: true,
        sessions: {
          where: { checkOutTime: null },
          orderBy: { sessionIndex: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException(
        'No active clock-in record found for today.',
      );
    }

    let sessionHours = 0;

    // 1. Close active session if exists
    if (record.sessions && record.sessions.length > 0) {
      const activeSession = record.sessions[0];
      const diffMs = now.getTime() - activeSession.checkInTime.getTime();
      sessionHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

      await this.prisma.attendanceSession.update({
        where: { id: activeSession.id },
        data: {
          checkOutTime: now,
          workingHours: sessionHours,
        },
      });
    }

    // 2. Aggregate cumulative working hours across all sessions for this shift/date
    const allSessions = await this.prisma.attendanceSession.findMany({
      where: { attendanceId: record.id },
    });

    let totalWorkingHours = 0;
    if (allSessions.length > 0) {
      totalWorkingHours = allSessions.reduce(
        (acc, s) => acc + (s.workingHours || 0),
        0,
      );
      totalWorkingHours = Math.round(totalWorkingHours * 100) / 100;
    } else {
      const fallbackMs =
        now.getTime() - (record.checkInTime?.getTime() || now.getTime());
      totalWorkingHours =
        Math.round((fallbackMs / (1000 * 60 * 60)) * 100) / 100;
    }

    // 3. Overtime calculation
    let overtimeHours = 0;
    if (record.shift) {
      const [startH, startM] = record.shift.startTime.split(':').map(Number);
      const [endH, endM] = record.shift.endTime.split(':').map(Number);
      const start = startH + startM / 60;
      let end = endH + endM / 60;
      if (record.shift.isNightShift || end < start) {
        end += 24;
      }
      const shiftDuration = Math.round((end - start) * 100) / 100;
      if (totalWorkingHours > shiftDuration) {
        overtimeHours =
          Math.round((totalWorkingHours - shiftDuration) * 100) / 100;
      }
    }

    // 4. Half-day and minimum hours evaluation
    const settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });
    const minFullDay = settings?.minimumHoursForFullDay ?? 8.0;
    let isHalfDay = false;
    let finalStatus = record.status;

    if (record.status !== 'PROXY_SHIFT_SWAP') {
      if (totalWorkingHours > 0 && totalWorkingHours < minFullDay) {
        finalStatus = 'HALF_DAY';
        isHalfDay = true;
      } else if (totalWorkingHours >= minFullDay) {
        finalStatus = record.isLate ? 'LATE' : 'PRESENT';
        isHalfDay = false;
      }
    }

    const updated = await this.prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOutTime: now,
        workingHours: totalWorkingHours,
        overtimeHours,
        status: finalStatus,
        isHalfDay,
      },
      include: {
        sessions: {
          orderBy: { sessionIndex: 'asc' },
        },
      },
    });

    return {
      message: 'Successfully clocked out!',
      data: updated,
      sessionHours,
      totalWorkingHours,
    };
  }

  async getMyHistory(employeeId: string, companyId: string) {
    return this.prisma.attendance.findMany({
      where: {
        employeeId,
        companyId,
      },
      include: {
        shift: true,
        sessions: {
          orderBy: { sessionIndex: 'asc' },
        },
        shiftSwapRequest: {
          include: {
            requester: {
              select: { id: true, firstName: true, lastName: true },
            },
            target: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 30,
    });
  }

  async getAdminTodayStats(companyId: string) {
    const timeZone = await this.getCompanyTimeZone(companyId);
    const { startOfDay: today, endOfDay } = this.getTenantDayBounds(
      timeZone,
      new Date(),
    );

    const totalEmployees = await this.prisma.employee.count({
      where: { companyId },
    });

    const todayRecords = await this.prisma.attendance.findMany({
      where: {
        companyId,
        date: {
          gte: today,
          lte: endOfDay,
        },
      },
    });

    const presentToday = todayRecords.filter(
      (record) => record.status === 'PRESENT',
    ).length;

    const lateToday = todayRecords.filter(
      (record) => record.status === 'LATE',
    ).length;

    const absentToday = totalEmployees - todayRecords.length;

    return {
      totalEmployees,
      presentToday,
      lateToday,
      absentToday,
    };
  }

  async getMyDashboardStats(employeeId: string, companyId: string) {
    const timeZone = await this.getCompanyTimeZone(companyId);
    const { startOfDay: today, endOfDay } = this.getTenantDayBounds(
      timeZone,
      new Date(),
    );

    const todayRecord = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        companyId,
        date: {
          gte: today,
          lte: endOfDay,
        },
      },
    });

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthRecords = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        companyId,
        date: {
          gte: startOfMonth,
          lte: endOfDay,
        },
      },
    });

    const presentDays = monthRecords.filter(
      (record) => record.status === 'PRESENT' || record.status === 'LATE',
    ).length;

    const absentDays = monthRecords.filter(
      (record) => record.status === 'ABSENT',
    ).length;

    const currentDayOfMonth = today.getDate();

    const attendancePercentage =
      Math.round((presentDays / currentDayOfMonth) * 100) || 0;

    return {
      todayStatus: todayRecord ? todayRecord.status : 'PENDING',

      checkInTime: todayRecord?.checkInTime || null,

      checkOutTime: todayRecord?.checkOutTime || null,

      workingHours: todayRecord?.workingHours || 0,

      presentDays,
      absentDays,
      attendancePercentage,
    };
  }

  async requestCorrection(
    employeeId: string,
    data: {
      date: Date;
      requestedCheckIn?: Date;
      requestedCheckOut?: Date;
      reason: string;
    },
  ) {
    const employee = this.prisma.employee?.findUnique
      ? await this.prisma.employee.findUnique({
          where: { id: employeeId },
          select: { companyId: true },
        })
      : null;
    const timeZone = employee?.companyId
      ? await this.getCompanyTimeZone(employee.companyId)
      : 'UTC';
    const { startOfDay, endOfDay } = this.getTenantDayBounds(
      timeZone,
      new Date(data.date),
    );

    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return this.prisma.attendanceCorrection.create({
      data: {
        employeeId,
        attendanceId: existingAttendance?.id || null,

        date: new Date(data.date),

        requestedCheckIn: data.requestedCheckIn
          ? new Date(data.requestedCheckIn)
          : null,

        requestedCheckOut: data.requestedCheckOut
          ? new Date(data.requestedCheckOut)
          : null,

        reason: data.reason,
        status: 'PENDING',
      },
    });
  }

  // Fetch pending corrections for HR
  async getPendingCorrections(companyId: string) {
    return this.prisma.attendanceCorrection.findMany({
      where: {
        employee: {
          companyId,
        },
        status: 'PENDING',
      },

      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attendance: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // HR approves/rejects correction
  async reviewCorrection(
    correctionId: string,
    reviewerId: string,
    companyId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewerNote?: string,
  ) {
    const correction = await this.prisma.attendanceCorrection.findUnique({
      where: {
        id: correctionId,
      },

      include: {
        employee: true,
      },
    });

    if (!correction || correction.employee.companyId !== companyId) {
      throw new NotFoundException('Correction request not found');
    }

    // Update correction status
    const updatedCorrection = await this.prisma.attendanceCorrection.update({
      where: {
        id: correctionId,
      },

      data: {
        status,
        reviewedById: reviewerId,
        reviewerNote,
      },
    });

    // If approved, update/create attendance
    if (status === 'APPROVED') {
      let workingHours = 0;
      let overtimeHours = 0;

      // Calculate working hours
      if (correction.requestedCheckIn && correction.requestedCheckOut) {
        const diffMs =
          correction.requestedCheckOut.getTime() -
          correction.requestedCheckIn.getTime();

        workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

        // Standard 9-hour workday threshold for overtime
        if (workingHours > 9) {
          overtimeHours = Math.round((workingHours - 9) * 100) / 100;
        }
      }

      const settings = await this.prisma.companySettings.findUnique({
        where: { companyId },
      });
      const minFullDay = settings?.minimumHoursForFullDay ?? 8.0;
      const isHalfDay = workingHours > 0 && workingHours < minFullDay;
      const finalStatus = isHalfDay ? 'HALF_DAY' : 'PRESENT';

      if (correction.attendanceId) {
        // Update existing attendance
        await this.prisma.attendance.update({
          where: {
            id: correction.attendanceId,
          },

          data: {
            checkInTime: correction.requestedCheckIn || undefined,

            checkOutTime: correction.requestedCheckOut || undefined,

            workingHours,
            overtimeHours,
            status: finalStatus,
            isHalfDay,
          },
        });
      } else {
        // Create missing attendance
        await this.prisma.attendance.create({
          data: {
            employeeId: correction.employeeId,

            companyId: correction.employee.companyId,

            date: correction.date,

            checkInTime: correction.requestedCheckIn,

            checkOutTime: correction.requestedCheckOut,

            workingHours,
            overtimeHours,

            status: finalStatus,
            isHalfDay,

            verificationMethod: 'MANUAL_CORRECTION',
          },
        });
      }
    }

    return updatedCorrection;
  }

  // ==========================================
  // COMPANY ATTENDANCE REGISTER & EXPORT
  // ==========================================
  async getCompanyAttendanceRecords(
    companyId: string,
    query: {
      date?: string;
      departmentId?: string;
      status?: string;
      search?: string;
    },
  ) {
    const timeZone = await this.getCompanyTimeZone(companyId);
    const targetRef = query.date ? new Date(query.date) : new Date();
    const { startOfDay: targetDate, endOfDay } = this.getTenantDayBounds(
      timeZone,
      targetRef,
    );

    // Fetch active employees
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        employmentStatus: { not: 'TERMINATED' },
        ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      },
      include: {
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true } },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    // Fetch all attendance records for targetDate
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        companyId,
        date: { gte: targetDate, lte: endOfDay },
      },
      include: {
        shift: true,
        sessions: { orderBy: { sessionIndex: 'asc' } },
      },
    });

    const attendanceMap = new Map<string, any>();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.employeeId, att);
    });

    // Fetch approved leaves on targetDate
    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        companyId,
        status: 'APPROVED',
        startDate: { lte: endOfDay },
        endDate: { gte: targetDate },
      },
    });
    const leaveMap = new Map<string, any>();
    approvedLeaves.forEach((lv) => {
      leaveMap.set(lv.employeeId, lv);
    });

    // Merge employee records
    let rows = employees.map((emp) => {
      const att = attendanceMap.get(emp.id);
      const leave = leaveMap.get(emp.id);

      let status = 'ABSENT';
      if (att) {
        status = att.status;
      } else if (leave) {
        status = 'ON_LEAVE';
      }

      return {
        id: att ? att.id : `virt-${emp.id}`,
        employeeId: emp.id,
        employeeCode: emp.employeeCode || emp.id.substring(0, 8),
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        email: emp.email,
        avatar: emp.profilePhoto || null,
        role: emp.role,
        department: emp.department?.name || 'Unassigned',
        departmentId: emp.departmentId,
        designation: emp.designation?.name || emp.role,
        date: targetDate.toISOString().split('T')[0],
        checkInTime: att?.checkInTime || null,
        checkOutTime: att?.checkOutTime || null,
        workingHours: att?.workingHours ?? 0,
        overtimeHours: att?.overtimeHours ?? 0,
        isLate: att?.isLate ?? false,
        isHalfDay: att?.isHalfDay ?? false,
        verificationMethod: att?.verificationMethod || 'NONE',
        shiftName: att?.shift?.name || 'Standard',
        status,
        leaveType: leave?.type || null,
      };
    });

    // Filter by search
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.employeeCode.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q),
      );
    }

    // Compute stats
    const stats = {
      total: rows.length,
      present: rows.filter(
        (r) =>
          r.status === 'PRESENT' ||
          r.status === 'LATE' ||
          r.status === 'PROXY_SHIFT_SWAP',
      ).length,
      late: rows.filter((r) => r.isLate || r.status === 'LATE').length,
      halfDay: rows.filter((r) => r.status === 'HALF_DAY' || r.isHalfDay)
        .length,
      absent: rows.filter((r) => r.status === 'ABSENT').length,
      onLeave: rows.filter((r) => r.status === 'ON_LEAVE').length,
    };

    // Filter by status if requested
    if (query.status && query.status !== 'ALL') {
      rows = rows.filter((r) => r.status === query.status);
    }

    return {
      date: targetDate.toISOString().split('T')[0],
      stats,
      records: rows,
    };
  }

  async exportCompanyAttendanceCsv(
    companyId: string,
    query: {
      date?: string;
      departmentId?: string;
      status?: string;
      search?: string;
    },
  ): Promise<string> {
    const { records } = await this.getCompanyAttendanceRecords(
      companyId,
      query,
    );

    const headers = [
      'Employee ID',
      'Employee Name',
      'Email',
      'Department',
      'Designation',
      'Date',
      'Status',
      'Check In',
      'Check Out',
      'Working Hours',
      'Overtime Hours',
      'Late',
      'Half Day',
      'Verification Method',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(',')];

    for (const r of records) {
      const checkInStr = r.checkInTime
        ? new Date(r.checkInTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '--:--';
      const checkOutStr = r.checkOutTime
        ? new Date(r.checkOutTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '--:--';

      const row = [
        escapeCsv(r.employeeCode),
        escapeCsv(r.name),
        escapeCsv(r.email),
        escapeCsv(r.department),
        escapeCsv(r.designation),
        escapeCsv(r.date),
        escapeCsv(r.status),
        escapeCsv(checkInStr),
        escapeCsv(checkOutStr),
        escapeCsv(r.workingHours),
        escapeCsv(r.overtimeHours),
        escapeCsv(r.isLate ? 'YES' : 'NO'),
        escapeCsv(r.isHalfDay ? 'YES' : 'NO'),
        escapeCsv(r.verificationMethod),
      ];
      csvRows.push(row.join(','));
    }

    // UTF-8 BOM for Excel / external parsers
    return '\uFEFF' + csvRows.join('\r\n');
  }
}
