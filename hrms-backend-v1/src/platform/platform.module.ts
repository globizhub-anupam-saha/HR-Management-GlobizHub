import { Module } from '@nestjs/common';
import { PlatformAuthModule } from './auth/platform-auth.module';
import { PlatformOrgModule } from './organizations/platform-org.module';
import { PlatformDashboardModule } from './dashboard/platform-dashboard.module';
import { PlatformSubscriptionModule } from './subscriptions/platform-subscription.module';
import { PlatformBillingModule } from './billing/platform-billing.module';
import { PlatformUsersModule } from './users/platform-users.module';
import { PlatformMonitoringModule } from './monitoring/platform-monitoring.module';
import { PlatformSupportModule } from './support/platform-support.module';

@Module({
  imports: [
    PlatformAuthModule,
    PlatformOrgModule,
    PlatformDashboardModule,
    PlatformSubscriptionModule,
    PlatformBillingModule,
    PlatformUsersModule,
    PlatformMonitoringModule,
    PlatformSupportModule,
  ],
  exports: [
    PlatformAuthModule,
    PlatformOrgModule,
    PlatformDashboardModule,
    PlatformSubscriptionModule,
    PlatformBillingModule,
    PlatformUsersModule,
    PlatformMonitoringModule,
    PlatformSupportModule,
  ],
})
export class PlatformModule {}
