import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OverrideSource } from '../../generated/prisma/client';

@Injectable()
export class AttendanceCronService {
  private readonly logger = new Logger(AttendanceCronService.name);

  constructor(private prisma: PrismaService) {}

  // Helper to calculate shift duration in hours
  private getShiftDurationHours(
    startTimeStr: string,
    endTimeStr: string,
    isNightShift: boolean,
  ): number {
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const start = startH + startM / 60;
    let end = endH + endM / 60;

    if (isNightShift || end < start) {
      end += 24; // spans past midnight
    }

    return Math.round((end - start) * 100) / 100;
  }

  /**
   * Helper to compute exact calendar day boundaries in the tenant's configured timezone
   */
  private getTenantDayBounds(
    timeZone: string = 'UTC',
    refDate: Date = new Date(),
  ): { today: Date; endOfDay: Date } {
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

      const today = new Date(utcMidnight.getTime() - offsetMs);
      const endOfDay = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
      return { today, endOfDay };
    } catch {
      const today = new Date(refDate);
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return { today, endOfDay };
    }
  }

  // This runs automatically every night at 11:59 PM
  @Cron('59 23 * * *')
  async handleDailyAttendanceCalculation() {
    this.logger.log('Starting daily attendance calculation...');

    // 1. Fetch all active employees
    const employees = await this.prisma.employee.findMany({
      include: { company: { include: { settings: true } } },
    });

    const BATCH_SIZE = 25;
    for (let i = 0; i < employees.length; i += BATCH_SIZE) {
      const batch = employees.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((employee) =>
          this.processSingleEmployeeDailyAttendance(employee).catch((err) => {
            this.logger.error(
              `Error processing daily attendance for employee ${employee.id}: ${err?.message}`,
            );
          }),
        ),
      );

      // Cooperative event-loop yield to keep the main event loop responsive
      await new Promise((resolve) => setImmediate(resolve));
    }

    this.logger.log(
      `Daily attendance calculation completed for ${employees.length} employees.`,
    );
  }

  async processSingleEmployeeDailyAttendance(employee: any) {
    const timeZone = employee.company?.settings?.timeZone || 'UTC';
    const { today, endOfDay } = this.getTenantDayBounds(timeZone, new Date());

    // Find their attendance record for today
    const record = await this.prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: { gte: today, lte: endOfDay },
      },
    });

    // Check if employee has a shift transfer override (meaning they gave their shift away)
    const override = await this.prisma.shiftAssignmentOverride.findFirst({
      where: {
        employeeId: employee.id,
        date: today,
        status: 'ACTIVE',
      },
    });

    // 2. Mark SHIFT_GIVEN if they gave their shift away and didn't clock in
    if (
      !record &&
      override &&
      override.overrideShiftId === null &&
      override.source === OverrideSource.SHIFT_SWAP
    ) {
      await this.prisma.attendance.create({
        data: {
          employeeId: employee.id,
          companyId: employee.companyId,
          date: today,
          status: 'SHIFT_GIVEN',
          workingHours: 0,
          overtimeHours: 0,
          shiftId: override.originalShiftId,
          shiftSwapRequestId: override.relatedSwapRequestId,
        },
      });
      return;
    }

    // 3. Handle employees with no attendance record today
    if (!record) {
      // A. Check if employee has a scheduled day off for today
      const schedule = await this.prisma.schedule.findFirst({
        where: { employeeId: employee.id, date: { gte: today, lte: endOfDay } },
      });
      if (schedule && schedule.shiftId === null) {
        this.logger.log(
          `Skipping absent marking for employee ${employee.id}: Scheduled Day Off.`,
        );
        return;
      }

      // B. Check Company Working Days (e.g. Weekends)
      const dayNames = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ];
      const todayDayName = dayNames[today.getDay()];
      const workingDays = employee.company.settings?.workingDays;
      if (
        Array.isArray(workingDays) &&
        workingDays.length > 0 &&
        !workingDays.includes(todayDayName)
      ) {
        this.logger.log(
          `Skipping absent marking for employee ${employee.id}: Non-working day (${todayDayName}).`,
        );
        return;
      }

      // C. Check Official Company / National Holiday
      const holiday = await this.prisma.holiday.findFirst({
        where: {
          companyId: employee.companyId,
          date: { gte: today, lte: endOfDay },
        },
      });
      if (holiday) {
        this.logger.log(
          `Skipping absent marking for employee ${employee.id}: Public/Company Holiday (${holiday.name}).`,
        );
        return;
      }

      // D. Check Approved Leave Request
      const approvedLeave = await this.prisma.leaveRequest.findFirst({
        where: {
          employeeId: employee.id,
          status: 'APPROVED',
          startDate: { lte: endOfDay },
          endDate: { gte: today },
        },
      });
      if (approvedLeave) {
        this.logger.log(
          `Marking ON_LEAVE for employee ${employee.id}: Approved Leave (${approvedLeave.type}).`,
        );
        await this.prisma.attendance.create({
          data: {
            employeeId: employee.id,
            companyId: employee.companyId,
            date: today,
            status: 'ON_LEAVE',
            workingHours: 0,
            overtimeHours: 0,
          },
        });
        return;
      }

      // E. True unexcused absence on a working day
      await this.prisma.attendance.create({
        data: {
          employeeId: employee.id,
          companyId: employee.companyId,
          date: today,
          status: 'ABSENT',
          workingHours: 0,
          overtimeHours: 0,
        },
      });
      return;
    }

    // 4. If they have a record, calculate Late Status, Working Hours, and Overtime
    let shift: any = null;
    if (record.shiftId) {
      shift = await this.prisma.shift.findUnique({
        where: { id: record.shiftId },
      });
    } else {
      const schedule = await this.prisma.schedule.findFirst({
        where: { employeeId: employee.id, date: today },
        include: { shift: true },
      });
      shift = schedule?.shift || null;
    }

    const shiftStartTimeStr = shift?.startTime || '09:00';
    const shiftEndTimeStr = shift?.endTime || '18:00';
    const [startH, startM] = shiftStartTimeStr.split(':').map(Number);
    const [endH, endM] = shiftEndTimeStr.split(':').map(Number);
    const isNight =
      record.isCrossMidnight || shift?.isNightShift || endH < startH;
    const grace = employee.company.settings?.gracePeriodMinutes ?? 15;

    // Cross-midnight protection
    if (!record.checkOutTime && isNight) {
      this.logger.log(
        `Skipping midnight auto-checkout for employee ${employee.id}: Active night shift in progress.`,
      );
      return;
    }

    let finalStatus = record.status;
    let totalHours = 0;
    let overtimeHours = 0;
    let isLate = false;

    const shiftStart = new Date(today);
    shiftStart.setHours(startH, startM, 0, 0);

    const defaultCheckOut = new Date(today);
    defaultCheckOut.setHours(endH, endM, 0, 0);
    if (isNight) {
      defaultCheckOut.setDate(defaultCheckOut.getDate() + 1);
    }

    const checkOutTime = record.checkOutTime || defaultCheckOut;

    const sessions = await this.prisma.attendanceSession.findMany({
      where: { attendanceId: record.id },
    });

    if (sessions.length > 0) {
      const sumSessionHours = sessions.reduce(
        (sum, s) => sum + (s.workingHours || 0),
        0,
      );
      totalHours = Math.round(sumSessionHours * 100) / 100;
    } else if (record.checkInTime) {
      const diffMs = checkOutTime.getTime() - record.checkInTime.getTime();
      totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    }

    const minFullDay = employee.company.settings?.minimumHoursForFullDay ?? 8.0;
    let isHalfDay = false;

    if (record.checkInTime) {
      const shiftStartWithGrace = new Date(shiftStart);
      shiftStartWithGrace.setMinutes(shiftStartWithGrace.getMinutes() + grace);

      if (record.checkInTime > shiftStartWithGrace) {
        isLate = true;
      }

      if (record.shiftSwapRequestId) {
        finalStatus = 'PROXY_SHIFT_SWAP';
      } else if (totalHours > 0 && totalHours < minFullDay) {
        finalStatus = 'HALF_DAY';
        isHalfDay = true;
      } else {
        finalStatus = isLate ? 'LATE' : 'PRESENT';
        isHalfDay = false;
      }

      const shiftDuration = this.getShiftDurationHours(
        shiftStartTimeStr,
        shiftEndTimeStr,
        isNight,
      );
      if (totalHours > shiftDuration) {
        const extra = totalHours - shiftDuration;
        if (record.shiftSwapRequestId) {
          const otIncludesSwap =
            employee.company.settings?.overtimeIncludesShiftSwaps ?? false;
          overtimeHours = otIncludesSwap ? extra : 0;
        } else {
          overtimeHours = extra;
        }
      }
    }

    await this.prisma.attendance.update({
      where: { id: record.id },
      data: {
        status: finalStatus,
        workingHours: totalHours,
        overtimeHours,
        isLate,
        isHalfDay,
        checkOutTime: record.checkOutTime ? record.checkOutTime : checkOutTime,
      },
    });
  }
}
