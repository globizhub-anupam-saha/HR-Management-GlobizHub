import { Module } from '@nestjs/common';
import { PlatformDashboardController } from './platform-dashboard.controller';
import { PlatformDashboardService } from './platform-dashboard.service';
import { PlatformSnapshotJob } from './platform-snapshot.job';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlatformAuthModule } from '../auth/platform-auth.module';

@Module({
  imports: [PrismaModule, PlatformAuthModule],
  controllers: [PlatformDashboardController],
  providers: [PlatformDashboardService, PlatformSnapshotJob],
  exports: [PlatformDashboardService, PlatformSnapshotJob],
})
export class PlatformDashboardModule {}
