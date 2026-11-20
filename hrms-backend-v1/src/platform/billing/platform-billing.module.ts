import { Module } from '@nestjs/common';
import { PlatformBillingService } from './platform-billing.service';
import { PlatformBillingController } from './platform-billing.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlatformAuthModule } from '../auth/platform-auth.module';

@Module({
  imports: [PrismaModule, PlatformAuthModule],
  controllers: [PlatformBillingController],
  providers: [PlatformBillingService],
  exports: [PlatformBillingService],
})
export class PlatformBillingModule {}
