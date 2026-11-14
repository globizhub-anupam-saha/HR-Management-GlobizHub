import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Response,
  ParseIntPipe,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { PayrollService } from './payroll.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { UpsertSalaryStructureDto } from './dto/upsert-salary-structure.dto';
import { GenerateBatchPayrollDto } from './dto/generate-batch-payroll.dto';
import { CalculateCtcDto } from './dto/calculate-ctc.dto';
import { FinalSettlementDto } from './dto/final-settlement.dto';
import {
  UpsertTaxDeclarationDto,
  VerifyTaxDeclarationDto,
} from './dto/tax-declaration.dto';
import { CreateLoanDto, UpdateLoanStatusDto } from './dto/employee-loan.dto';

@Controller('payroll')
@UseGuards(AuthGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // HR/Admin: Generate payroll for a single employee
  @Post('generate')
  @RequirePermissions('payroll.manage')
  async generatePayroll(
    @Request() req,
    @Body('employeeId') employeeId: string,
    @Body('month', ParseIntPipe) month: number,
    @Body('year', ParseIntPipe) year: number,
  ) {
    return this.payrollService.generateMonthlyPayroll(
      req.user.companyId,
      employeeId,
      month,
      year,
      req.user.sub,
    );
  }

  // HR/Admin: Bulk payroll run for the entire company or department (P-14)
  @Post('generate-batch')
  @RequirePermissions('payroll.manage')
  async generateBatchPayroll(
    @Request() req,
    @Body() dto: GenerateBatchPayrollDto,
  ) {
    return this.payrollService.generateBatchPayroll(
      req.user.companyId,
      dto.month,
      dto.year,
      req.user.sub,
      dto.departmentId,
    );
  }

  // HR/Admin: Server-side CTC & Statutory Breakdown Calculator (P-08, P-17)
  @Post('calculate-ctc')
  @RequirePermissions('payroll.manage')
  calculateCtc(@Body() dto: CalculateCtcDto) {
    return this.payrollService.calculateCtc(dto);
  }

  // HR/Admin: Download bank payout advice file (CSV) for NEFT/RTGS bulk payment (P-19)
  @Get('bank-advice')
  @RequirePermissions('payroll.manage')
  async getBankAdvice(
    @Request() req,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Response() res: ExpressResponse,
  ) {
    const csvContent = await this.payrollService.generateBankAdviceCsv(
      req.user.companyId,
      month,
      year,
    );

    const filename = `bank_advice_${String(month).padStart(2, '0')}_${year}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  }

  // HR/Admin: Dispatch payslip summary email to employee (P-18)
  @Post(':id/send-email')
  @RequirePermissions('payroll.manage')
  async sendPayslipEmail(@Request() req, @Param('id') id: string) {
    return this.payrollService.sendPayslipEmail(
      req.user.companyId,
      id,
      req.user.sub,
    );
  }

  // HR/Admin: View company payrolls for a specific month
  @Get('company')
  @RequirePermissions('payroll.manage')
  async getCompanyPayroll(
    @Request() req,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.payrollService.getCompanyPayrollByMonth(
      req.user.companyId,
      month,
      year,
    );
  }

  // Employee: Get their own payslips
  @Get('my-payslips')
  async getMyPayslips(@Request() req) {
    return this.payrollService.getMyPayslips(req.user.sub);
  }

  @Post(':id/log-download')
  async logDownload(@Request() req, @Param('id') id: string) {
    return this.payrollService.logPayslipDownload(
      req.user.sub,
      req.user.companyId,
      id,
    );
  }

  // HR/Admin: Get an employee's salary structure
  @Get('salary-structure/:employeeId')
  @RequirePermissions('payroll.view')
  async getSalaryStructure(
    @Request() req,
    @Param('employeeId') employeeId: string,
  ) {
    return this.payrollService.getSalaryStructure(req.user.companyId, employeeId);
  }

  // HR/Admin: Set an employee's salary structure (supports both /salary-structure and /salary-structure/:employeeId)
  @Post(['salary-structure', 'salary-structure/:employeeId'])
  @RequirePermissions('payroll.manage')
  async setSalaryStructure(
    @Request() req,
    @Param('employeeId') paramEmpId: string,
    @Body('employeeId') bodyEmpId: string,
    @Body() dto: UpsertSalaryStructureDto,
  ) {
    const targetEmpId = paramEmpId || bodyEmpId || (dto as any)?.employeeId;
    const { employeeId: _id, ...salaryData } = dto as any;
    return this.payrollService.upsertSalaryStructure(
      req.user.companyId,
      targetEmpId,
      salaryData,
      req.user.sub,
    );
  }

  // HR/Admin: Update payroll status (DRAFT -> APPROVED -> PAID)
  @Patch(':id/status')
  @RequirePermissions('payroll.manage')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.payrollService.updatePayrollStatus(
      req.user.companyId,
      id,
      status,
      req.user.role,
      req.user.sub,
    );
  }

  @Post('templates')
  @RequirePermissions('payroll.manage')
  async createTemplate(@Request() req, @Body() body: any) {
    return this.payrollService.createSalaryTemplate(req.user.companyId, body);
  }

  @Get('templates')
  @RequirePermissions('payroll.manage')
  async getTemplates(@Request() req) {
    return this.payrollService.getSalaryTemplates(req.user.companyId);
  }

  @Patch('templates/:id')
  @Put('templates/:id')
  @RequirePermissions('payroll.manage')
  async updateTemplate(
    @Request() req,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.payrollService.updateSalaryTemplate(
      req.user.companyId,
      id,
      body,
    );
  }

  @Delete('templates/:id')
  @RequirePermissions('payroll.manage')
  async deleteTemplate(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.payrollService.deleteSalaryTemplate(
      req.user.companyId,
      id,
    );
  }

  // ==========================================
  // FULL & FINAL SETTLEMENT (F&F)
  // ==========================================
  @Post('settlement/calculate')
  @RequirePermissions('payroll.manage')
  async calculateSettlement(@Request() req, @Body() dto: FinalSettlementDto) {
    return this.payrollService.calculateFinalSettlement(
      req.user.companyId,
      dto,
    );
  }

  @Post('settlement/process')
  @RequirePermissions('payroll.manage')
  async processSettlement(@Request() req, @Body() dto: FinalSettlementDto) {
    return this.payrollService.processFinalSettlement(
      req.user.companyId,
      dto,
      req.user.sub,
    );
  }

  // ==========================================
  // SALARY HOLD & RELEASE
  // ==========================================
  @Patch(':id/hold')
  @RequirePermissions('payroll.manage')
  async holdPayroll(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.payrollService.holdPayrollRecord(
      req.user.companyId,
      id,
      reason,
      req.user.sub,
    );
  }

  @Patch(':id/release')
  @RequirePermissions('payroll.manage')
  async releasePayroll(@Request() req, @Param('id') id: string) {
    return this.payrollService.releasePayrollRecord(
      req.user.companyId,
      id,
      req.user.sub,
    );
  }

  // ==========================================
  // INCOME TAX & IT DECLARATIONS
  // ==========================================
  @Post('tax-declarations')
  async upsertTaxDeclaration(
    @Request() req,
    @Body() dto: UpsertTaxDeclarationDto,
  ) {
    return this.payrollService.upsertTaxDeclaration(
      req.user.companyId,
      req.user.sub,
      dto,
      req.user.sub,
    );
  }

  @Get('tax-declarations/my')
  async getMyTaxDeclaration(
    @Request() req,
    @Query('financialYear') financialYear: string,
  ) {
    const fy = financialYear || '2026-2027';
    return this.payrollService.getTaxDeclaration(
      req.user.companyId,
      req.user.sub,
      fy,
    );
  }

  @Get('tax-declarations/company')
  @RequirePermissions('payroll.view')
  async listCompanyTaxDeclarations(
    @Request() req,
    @Query('financialYear') financialYear?: string,
  ) {
    return this.payrollService.listCompanyTaxDeclarations(
      req.user.companyId,
      financialYear,
    );
  }

  @Patch('tax-declarations/:id/verify')
  @RequirePermissions('payroll.manage')
  async verifyTaxDeclaration(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: VerifyTaxDeclarationDto,
  ) {
    return this.payrollService.verifyTaxDeclaration(
      req.user.companyId,
      id,
      dto,
      req.user.sub,
    );
  }

  // ==========================================
  // FORM 16 & FORM 24Q
  // ==========================================
  @Get('form16/my')
  async getMyForm16(
    @Request() req,
    @Query('financialYear') financialYear: string,
  ) {
    const fy = financialYear || '2026-2027';
    return this.payrollService.getForm16(req.user.companyId, req.user.sub, fy);
  }

  @Get('form16/:employeeId')
  @RequirePermissions('payroll.view')
  async getEmployeeForm16(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Query('financialYear') financialYear: string,
  ) {
    const fy = financialYear || '2026-2027';
    return this.payrollService.getForm16(req.user.companyId, employeeId, fy);
  }

  @Get('form24q')
  @RequirePermissions('payroll.manage')
  async downloadForm24Q(
    @Request() req,
    @Query('quarter') quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
    @Query('financialYear') financialYear: string,
    @Response() res: ExpressResponse,
  ) {
    const q = quarter || 'Q4';
    const fy = financialYear || '2026-2027';
    const result = await this.payrollService.getForm24Q(
      req.user.companyId,
      q,
      fy,
    );

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.fileName}"`,
    );
    return res.status(200).send(result.content);
  }

  // ==========================================
  // LOANS & SALARY ADVANCES
  // ==========================================
  @Post('loans')
  @RequirePermissions('payroll.manage')
  async createLoan(@Request() req, @Body() dto: CreateLoanDto) {
    return this.payrollService.createLoan(
      req.user.companyId,
      dto,
      req.user.sub,
    );
  }

  @Get('loans/my')
  async getMyLoans(@Request() req) {
    return this.payrollService.getMyLoans(req.user.sub);
  }

  @Get('loans/company')
  @RequirePermissions('payroll.view')
  async listCompanyLoans(
    @Request() req,
    @Query('status') status?: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.payrollService.listCompanyLoans(
      req.user.companyId,
      status,
      employeeId,
    );
  }

  @Patch('loans/:id/status')
  @RequirePermissions('payroll.manage')
  async updateLoanStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateLoanStatusDto,
  ) {
    return this.payrollService.updateLoanStatus(
      req.user.companyId,
      id,
      dto,
      req.user.sub,
    );
  }

  // ==========================================
  // ACCOUNTING JOURNAL VOUCHER (JV)
  // ==========================================
  @Get('journal-voucher')
  @RequirePermissions('payroll.manage')
  async getPayrollJv(
    @Request() req,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('format') format: string,
    @Response() res: ExpressResponse,
  ) {
    const jv = await this.payrollService.generatePayrollJv(
      req.user.companyId,
      month,
      year,
    );

    if (format === 'csv') {
      const filename = `payroll_jv_${String(month).padStart(2, '0')}_${year}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      return res.status(200).send(jv.csvContent);
    }

    return res.status(200).json(jv);
  }

  // ==========================================
  // SECTION 194J CONSULTANT / DOCTOR PAYOUTS
  // ==========================================
  @Get('consultant/payouts')
  @RequirePermissions('payroll.view')
  async getConsultantPayouts(
    @Request() req,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.payrollService.getConsultantPayouts(
      req.user.companyId,
      month,
      year,
    );
  }

  @Get('consultant/:employeeId/form16a')
  @RequirePermissions('payroll.view')
  async getConsultantForm16A(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Query('financialYear') financialYear: string,
    @Query('quarter', ParseIntPipe) quarter: number,
  ) {
    return this.payrollService.generateForm16A(
      req.user.companyId,
      employeeId,
      financialYear || '2026-2027',
      quarter || 1,
    );
  }
}
