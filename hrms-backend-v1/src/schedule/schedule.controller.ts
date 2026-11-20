import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import {
  BulkAssignScheduleDto,
  ApplyRotationPatternDto,
  QueryRosterMatrixDto,
} from './dto/schedule-operations.dto';

@Controller('schedules')
@UseGuards(AuthGuard, PermissionsGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('me')
  async getMySchedule(@Request() req) {
    return this.scheduleService.getMySchedule(req.user.sub, req.user.companyId);
  }

  // S-05: Ensure employees can only query their own schedule unless they hold manager/admin role
  @Get('employee/:employeeId')
  async getEmployeeSchedule(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Query('date') date: string,
  ) {
    if (
      req.user.sub !== employeeId &&
      !['SUPER_ADMIN', 'OWNER', 'HR_HEAD', 'MANAGER'].includes(req.user.role)
    ) {
      throw new ForbiddenException(
        "You do not have permission to view other employees' schedules.",
      );
    }
    return this.scheduleService.getEmployeeScheduleOnDate(
      employeeId,
      date,
      req.user.companyId,
    );
  }

  // ==========================================
  // ROSTER MATRIX GRID API (Visual SaaS Grid)
  // ==========================================
  @Get('matrix')
  @RequirePermissions('schedule.view')
  async getRosterMatrix(@Request() req, @Query() query: QueryRosterMatrixDto) {
    return this.scheduleService.getRosterMatrix(
      req.user.companyId,
      req.user.sub,
      req.user.role,
      query,
    );
  }

  // ==========================================
  // BULK & RECURRING ROSTER GENERATION
  // ==========================================
  @Post('bulk-assign')
  @RequirePermissions('schedule.create')
  async bulkAssignSchedule(@Request() req, @Body() dto: BulkAssignScheduleDto) {
    return this.scheduleService.bulkAssignSchedule(
      req.user.companyId,
      dto,
      req.user.role,
      req.user.sub,
    );
  }

  @Post('apply-rotation')
  @RequirePermissions('schedule.create')
  async applyRotationPattern(
    @Request() req,
    @Body() dto: ApplyRotationPatternDto,
  ) {
    return this.scheduleService.applyRotationPattern(
      req.user.companyId,
      dto,
      req.user.role,
      req.user.sub,
    );
  }

  @Post('shifts')
  @RequirePermissions('schedule.create')
  async createShift(@Request() req, @Body() dto: any) {
    return this.scheduleService.createShift(
      req.user.companyId,
      dto,
      req.user.role,
      req.user.sub,
    );
  }

  @Get('shifts')
  async getShifts(@Request() req) {
    return this.scheduleService.getShifts(req.user.companyId);
  }

  @Patch('shifts/:id')
  @RequirePermissions('schedule.edit')
  async updateShift(@Request() req, @Param('id') id: string, @Body() dto: any) {
    return this.scheduleService.updateShift(
      id,
      req.user.companyId,
      dto,
      req.user.role,
      req.user.sub,
    );
  }

  @Delete('shifts/:id')
  @RequirePermissions('schedule.delete')
  async deleteShift(@Request() req, @Param('id') id: string) {
    return this.scheduleService.deleteShift(
      id,
      req.user.companyId,
      req.user.role,
      req.user.sub,
    );
  }

  @Post('assign')
  @RequirePermissions('schedule.create')
  async assignSchedule(@Request() req, @Body() dto: any) {
    return this.scheduleService.assignSchedule(
      req.user.companyId,
      dto,
      req.user.role,
      req.user.sub,
    );
  }
}
