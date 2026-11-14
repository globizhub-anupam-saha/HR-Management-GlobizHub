import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { StatutoryEstablishmentService } from './common/statutory-establishment.service';
import { StatutoryRulesService } from './common/statutory-rules.service';
import { StatutoryCalculatorService } from './common/statutory-calculator.service';
import { EpfoCalculatorService } from './epfo/epfo-calculator.service';
import { EpfoEcrGeneratorService } from './epfo/epfo-ecr-generator.service';
import { EsicCalculatorService } from './esic/esic-calculator.service';
import { EsicFileGeneratorService } from './esic/esic-file-generator.service';
import { StatutoryReturnService } from './returns/statutory-return.service';
import { StatutoryReconciliationService } from './reconciliation/statutory-reconciliation.service';
import { StatutoryComplianceController } from './statutory-compliance.controller';

@Module({
  imports: [PrismaModule],
  controllers: [StatutoryComplianceController],
  providers: [
    StatutoryEstablishmentService,
    StatutoryRulesService,
    EpfoCalculatorService,
    EpfoEcrGeneratorService,
    EsicCalculatorService,
    EsicFileGeneratorService,
    StatutoryCalculatorService,
    StatutoryReturnService,
    StatutoryReconciliationService,
  ],
  exports: [
    StatutoryEstablishmentService,
    StatutoryRulesService,
    StatutoryCalculatorService,
    StatutoryReturnService,
    StatutoryReconciliationService,
    EpfoCalculatorService,
    EpfoEcrGeneratorService,
    EsicCalculatorService,
    EsicFileGeneratorService,
  ],
})
export class StatutoryComplianceModule {}

