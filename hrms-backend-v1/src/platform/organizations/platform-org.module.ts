import { Module } from '@nestjs/common';
import { PlatformOrgController } from './platform-org.controller';
import { PlatformOrgService } from './platform-org.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlatformAuthModule } from '../auth/platform-auth.module';

@Module({
  imports: [PrismaModule, PlatformAuthModule],
  controllers: [PlatformOrgController],
  providers: [PlatformOrgService],
  exports: [PlatformOrgService],
})
export class PlatformOrgModule {}
