import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../s3/s3.module';
import { AuditModule } from '../audit/audit.module';
import { EmailModule } from '../email/email.module';
import { StatutoryComplianceModule } from './statutory-compliance/statutory-compliance.module';
import { Form16GeneratorService } from './tax/form16-generator.service';
import { PayrollJvService } from './journal/payroll-jv.service';

@Module({
  imports: [
    PrismaModule,
    S3Module,
    AuditModule,
    EmailModule,
    StatutoryComplianceModule,
  ],
  controllers: [PayrollController],
  providers: [PayrollService, Form16GeneratorService, PayrollJvService],
  exports: [
    PayrollService,
    StatutoryComplianceModule,
    Form16GeneratorService,
    PayrollJvService,
  ],
})
export class PayrollModule {}
