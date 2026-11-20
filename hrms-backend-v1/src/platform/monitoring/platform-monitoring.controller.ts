import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PlatformMonitoringService } from './platform-monitoring.service';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator';

@Controller('platform')
@UseGuards(PlatformAuthGuard, PlatformRolesGuard)
export class PlatformMonitoringController {
  constructor(private readonly monitoringService: PlatformMonitoringService) {}

  @Get('audit')
  @PlatformRoles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async getAuditLogs(
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('targetEntity') targetEntity?: string,
    @Query('companyId') companyId?: string,
    @Query('actorEmail') actorEmail?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.monitoringService.getAuditLogs({
      search,
      action,
      targetEntity,
      companyId,
      actorEmail,
      page,
      limit,
    });
  }

  @Get('health')
  async getSystemHealth() {
    return this.monitoringService.getSystemHealth();
  }
}
