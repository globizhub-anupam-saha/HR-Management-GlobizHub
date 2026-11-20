import { Module } from '@nestjs/common';
import { PlatformMonitoringService } from './platform-monitoring.service';
import { PlatformMonitoringController } from './platform-monitoring.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlatformAuthModule } from '../auth/platform-auth.module';

@Module({
  imports: [PrismaModule, PlatformAuthModule],
  controllers: [PlatformMonitoringController],
  providers: [PlatformMonitoringService],
  exports: [PlatformMonitoringService],
})
export class PlatformMonitoringModule {}
