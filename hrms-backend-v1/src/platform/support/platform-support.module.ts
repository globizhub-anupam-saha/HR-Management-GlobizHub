import { Module } from '@nestjs/common';
import { PlatformSupportService } from './platform-support.service';
import { PlatformSupportController } from './platform-support.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlatformAuthModule } from '../auth/platform-auth.module';

@Module({
  imports: [PrismaModule, PlatformAuthModule],
  controllers: [PlatformSupportController],
  providers: [PlatformSupportService],
  exports: [PlatformSupportService],
})
export class PlatformSupportModule {}
