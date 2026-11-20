import { Module } from '@nestjs/common';
import { PlatformUsersService } from './platform-users.service';
import { PlatformUsersController } from './platform-users.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlatformAuthModule } from '../auth/platform-auth.module';

@Module({
  imports: [PrismaModule, PlatformAuthModule],
  controllers: [PlatformUsersController],
  providers: [PlatformUsersService],
  exports: [PlatformUsersService],
})
export class PlatformUsersModule {}
