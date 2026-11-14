import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CredentialController],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule {}

