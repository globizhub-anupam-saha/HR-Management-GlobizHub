import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PlatformDashboardService } from './platform-dashboard.service';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator';

@Controller('platform/dashboard')
@UseGuards(PlatformAuthGuard, PlatformRolesGuard)
export class PlatformDashboardController {
  constructor(private readonly dashboardService: PlatformDashboardService) {}

  @Get('overview')
  async getOverview(@Query('period') period?: string) {
    return this.dashboardService.getOverview(period || '30d');
  }

  @Post('recalculate-snapshots')
  @PlatformRoles('SUPER_ADMIN')
  async recalculateSnapshots() {
    return this.dashboardService.triggerSnapshotRecalculation();
  }
}
