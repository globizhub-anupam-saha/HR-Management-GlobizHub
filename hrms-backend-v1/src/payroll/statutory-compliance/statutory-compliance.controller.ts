import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Response,
  ParseIntPipe,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { AuthGuard } from '../../auth/auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { StatutoryEstablishmentService } from './common/statutory-establishment.service';
import { StatutoryRulesService } from './common/statutory-rules.service';
import { StatutoryCalculatorService } from './common/statutory-calculator.service';
import { StatutoryReturnService } from './returns/statutory-return.service';
import { StatutoryReconciliationService } from './reconciliation/statutory-reconciliation.service';
import {
  CreateEstablishmentDto,
  UpdateEstablishmentDto,
} from './dto/establishment.dto';
import { UpsertStatutoryRuleDto } from './dto/statutory-rule.dto';
import { UpsertEmployeeStatutoryProfileDto } from './dto/employee-statutory-profile.dto';
import {
  CalculateStatutoryDto,
  GenerateStatutoryFileDto,
  SubmitStatutoryReturnDto,
  CreateChallanDto,
  RecordStatutoryPaymentDto,
} from './dto/statutory-operations.dto';

@Controller('payroll/statutory')
@UseGuards(AuthGuard, PermissionsGuard)
export class StatutoryComplianceController {
  constructor(
    private readonly establishmentService: StatutoryEstablishmentService,
    private readonly rulesService: StatutoryRulesService,
    private readonly calculatorService: StatutoryCalculatorService,
    private readonly returnService: StatutoryReturnService,
    private readonly reconciliationService: StatutoryReconciliationService,
  ) {}

  // 1. Establishments
  @Get('establishments')
  @RequirePermissions('payroll.view')
  async listEstablishments(@Request() req) {
    return this.establishmentService.listEstablishments(req.user.companyId);
  }

  @Post('establishments')
  @RequirePermissions('payroll.manage')
  async createEstablishment(@Request() req, @Body() dto: CreateEstablishmentDto) {
    return this.establishmentService.createEstablishment(req.user.companyId, dto);
  }

  @Get('establishments/:id')
  @RequirePermissions('payroll.view')
  async getEstablishment(@Request() req, @Param('id') id: string) {
    return this.establishmentService.getEstablishment(req.user.companyId, id);
  }

  @Patch('establishments/:id')
  @RequirePermissions('payroll.manage')
  async updateEstablishment(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateEstablishmentDto,
  ) {
    return this.establishmentService.updateEstablishment(req.user.companyId, id, dto);
  }

  // 2. Rules
  @Get('rules/:establishmentId')
  @RequirePermissions('payroll.view')
  async listRules(@Request() req, @Param('establishmentId') establishmentId: string) {
    return this.rulesService.listRules(req.user.companyId, establishmentId);
  }

  @Post('rules')
  @RequirePermissions('payroll.manage')
  async upsertRule(@Request() req, @Body() dto: UpsertStatutoryRuleDto) {
    return this.rulesService.upsertRule(req.user.companyId, dto);
  }

  // 3. Employee Profiles
  @Post('employee-profile')
  @RequirePermissions('payroll.manage')
  async upsertEmployeeProfile(
    @Request() req,
    @Body() dto: UpsertEmployeeStatutoryProfileDto,
  ) {
    return this.establishmentService.upsertEmployeeProfile(req.user.companyId, dto);
  }

  @Get('employee-profiles/:establishmentId')
  @RequirePermissions('payroll.view')
  async listEmployeeProfiles(
    @Request() req,
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.establishmentService.listEmployeeProfiles(req.user.companyId, establishmentId);
  }

  // 4. Calculations
  @Post('calculate')
  @RequirePermissions('payroll.manage')
  async calculateStatutory(@Request() req, @Body() dto: CalculateStatutoryDto) {
    return this.calculatorService.calculateAndSnapshot(req.user.companyId, dto);
  }

  // 5. File Generation (EPFO .txt ECR & ESIC CSV)
  @Post('generate-file')
  @RequirePermissions('payroll.manage')
  async generateFile(
    @Request() req,
    @Body() dto: GenerateStatutoryFileDto,
    @Response() res: ExpressResponse,
  ) {
    const result = await this.returnService.generateReturnFile(req.user.companyId, dto);

    res.setHeader('Content-Type', dto.type === 'PF' ? 'text/plain; charset=utf-8' : 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.setHeader('X-Return-Id', result.returnId);
    return res.send(result.fileContent);
  }

  // 6. Submissions & Challans
  @Post('submit')
  @RequirePermissions('payroll.manage')
  async recordPortalSubmission(
    @Request() req,
    @Body() dto: SubmitStatutoryReturnDto,
  ) {
    return this.returnService.recordPortalSubmission(req.user.companyId, dto);
  }

  @Post('challans')
  @RequirePermissions('payroll.manage')
  async createChallan(@Request() req, @Body() dto: CreateChallanDto) {
    return this.returnService.createChallan(req.user.companyId, dto);
  }

  @Post('record-payment')
  @RequirePermissions('payroll.manage')
  async recordPayment(
    @Request() req,
    @Body() dto: RecordStatutoryPaymentDto,
  ) {
    return this.returnService.recordPayment(req.user.companyId, dto);
  }

  // 7. Returns Dashboard List
  @Get('returns')
  @RequirePermissions('payroll.view')
  async listReturns(
    @Request() req,
    @Query('establishmentId') establishmentId?: string,
    @Query('year') year?: string,
  ) {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    return this.returnService.listReturns(req.user.companyId, establishmentId, parsedYear);
  }

  // 8. Reconciliation
  @Post('reconcile/:returnId')
  @RequirePermissions('payroll.manage')
  async reconcileReturn(
    @Request() req,
    @Param('returnId') returnId: string,
    @Body() body: { notes?: string },
  ) {
    return this.reconciliationService.reconcileReturn(
      req.user.companyId,
      returnId,
      body?.notes,
    );
  }

  @Get('reconciliations')
  @RequirePermissions('payroll.view')
  async listReconciliations(
    @Request() req,
    @Query('returnId') returnId?: string,
    @Query('establishmentId') establishmentId?: string,
  ) {
    return this.reconciliationService.getReconciliations(
      req.user.companyId,
      returnId,
      establishmentId,
    );
  }
}

