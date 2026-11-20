import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PayrollService } from '../payroll.service';

export interface BatchRunProgressResponse {
  jobId: string;
  status: string; // QUEUED, PROCESSING, COMPLETED, FAILED
  month: number;
  year: number;
  totalEmployees: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  percentComplete: number;
  startedAt: Date | null;
  completedAt: Date | null;
  departmentId: string | null;
  errorLog?: any;
}

@Injectable()
export class PayrollBatchQueueService implements OnModuleInit {
  private readonly logger = new Logger(PayrollBatchQueueService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => PayrollService))
    private readonly payrollService: PayrollService,
  ) {}

  /**
   * Boot-time reconciliation: Recovers zombie batch runs stuck in PROCESSING on server restart
   */
  async onModuleInit() {
    try {
      const staleThreshold = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes ago
      const zombieRuns = await this.prisma.payrollBatchRun.updateMany({
        where: {
          status: { in: ['QUEUED', 'PROCESSING'] },
          updatedAt: { lt: staleThreshold },
        },
        data: {
          status: 'FAILED',
          errorLog: JSON.stringify([
            {
              reason:
                'Execution interrupted: Server restarted or terminated while batch was active. Please trigger a new run.',
              timestamp: new Date().toISOString(),
            },
          ]),
          completedAt: new Date(),
        },
      });

      if (zombieRuns.count > 0) {
        this.logger.warn(
          `Boot-time reconciliation: Marked ${zombieRuns.count} abandoned payroll batch runs as FAILED`,
        );
      }
    } catch (err: any) {
      this.logger.error(
        `Failed to reconcile abandoned payroll batch runs on startup: ${err?.message}`,
      );
    }
  }

  /**
   * Enqueues a batch payroll run and immediately returns a job ticket.
   * Completely offloads execution from the HTTP request thread, preventing 504 Gateway Timeouts.
   */
  async enqueueBatchRun(
    companyId: string,
    month: number,
    year: number,
    actorId: string,
    departmentId?: string,
  ): Promise<{
    jobId: string;
    status: string;
    totalEmployees: number;
    month: number;
    year: number;
    message: string;
  }> {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12.');
    }
    if (year < 2020 || year > 2100) {
      throw new BadRequestException('Invalid payroll year.');
    }

    // Check if an existing run is already in progress for this month/year
    const activeRun = await this.prisma.payrollBatchRun.findFirst({
      where: {
        companyId,
        month,
        year,
        status: { in: ['QUEUED', 'PROCESSING'] },
      },
    });

    if (activeRun) {
      return {
        jobId: activeRun.id,
        status: activeRun.status,
        totalEmployees: activeRun.totalEmployees,
        month,
        year,
        message: 'A batch payroll run is already in progress for this period.',
      };
    }

    // Fetch active candidate employees
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        employmentStatus: 'ACTIVE',
        ...(departmentId ? { departmentId } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
      },
      orderBy: { employeeCode: 'asc' },
    });

    const batchRun = await this.prisma.payrollBatchRun.create({
      data: {
        companyId,
        month,
        year,
        status: 'PROCESSING',
        totalEmployees: employees.length,
        processedCount: 0,
        successCount: 0,
        failureCount: 0,
        skippedCount: 0,
        departmentId: departmentId || null,
        createdById: actorId,
        startedAt: new Date(),
      },
    });

    // Fire background execution asynchronously without blocking HTTP response
    setImmediate(() => {
      this.processBatchRun(
        batchRun.id,
        companyId,
        month,
        year,
        actorId,
        employees,
      ).catch((err) => {
        this.logger.error(
          `Fatal error in batch run ${batchRun.id}: ${err.message}`,
          err.stack,
        );
      });
    });

    return {
      jobId: batchRun.id,
      status: 'PROCESSING',
      totalEmployees: employees.length,
      month,
      year,
      message: `Batch payroll run initiated for ${employees.length} employees. Use GET /payroll/batch/${batchRun.id} to track progress.`,
    };
  }

  /**
   * Background Worker: Iterates through employees in chunks with event-loop cooperative yields.
   */
  private async processBatchRun(
    runId: string,
    companyId: string,
    month: number,
    year: number,
    actorId: string,
    employees: Array<{
      id: string;
      firstName: string;
      lastName: string;
      employeeCode: string | null;
    }>,
  ): Promise<void> {
    this.logger.log(
      `Starting background processing for batch run ${runId} (${employees.length} employees)`,
    );

    const existingRecords =
      (await this.prisma.payrollRecord.findMany({
        where: { companyId, month, year },
        select: { employeeId: true },
      })) || [];
    const existingIds = new Set(
      (existingRecords || []).map((r) => r.employeeId),
    );

    let processedCount = 0;
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    const errorDetails: Array<{
      employeeId: string;
      code?: string | null;
      name: string;
      reason: string;
    }> = [];

    const CHUNK_SIZE = 10;

    for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
      const chunk = employees.slice(i, i + CHUNK_SIZE);

      for (const emp of chunk) {
        const empName = `${emp.firstName} ${emp.lastName}`.trim();

        // 1. Skip if already processed in this period
        if (existingIds.has(emp.id)) {
          skippedCount++;
          processedCount++;
          errorDetails.push({
            employeeId: emp.id,
            code: emp.employeeCode,
            name: empName,
            reason: 'Payroll already exists for this period',
          });
          continue;
        }

        try {
          await this.payrollService.generateMonthlyPayroll(
            companyId,
            emp.id,
            month,
            year,
            actorId,
          );
          successCount++;
        } catch (err: any) {
          if (
            err.message &&
            err.message.includes('No active salary structure')
          ) {
            skippedCount++;
            errorDetails.push({
              employeeId: emp.id,
              code: emp.employeeCode,
              name: empName,
              reason: 'No salary structure configured',
            });
          } else {
            failureCount++;
            errorDetails.push({
              employeeId: emp.id,
              code: emp.employeeCode,
              name: empName,
              reason: err.message || 'Calculation error',
            });
          }
        } finally {
          processedCount++;
        }
      }

      // Checkpoint progress to DB after each chunk
      await this.prisma.payrollBatchRun.update({
        where: { id: runId },
        data: {
          processedCount,
          successCount,
          failureCount,
          skippedCount,
          errorLog: errorDetails.slice(-50), // Store up to 50 latest error messages
        },
      });

      // Cooperative yield to keep event loop free for other API requests
      await new Promise((resolve) => setImmediate(resolve));
    }

    // Mark completion
    await this.prisma.payrollBatchRun.update({
      where: { id: runId },
      data: {
        status: failureCount > 0 && successCount === 0 ? 'FAILED' : 'COMPLETED',
        processedCount,
        successCount,
        failureCount,
        skippedCount,
        completedAt: new Date(),
        errorLog: errorDetails,
      },
    });

    this.logger.log(
      `Batch run ${runId} finished. Processed: ${processedCount}, Success: ${successCount}, Failures: ${failureCount}, Skipped: ${skippedCount}`,
    );
  }

  /**
   * Fetches real-time status of a batch payroll job.
   */
  async getBatchRunProgress(
    companyId: string,
    jobId: string,
  ): Promise<BatchRunProgressResponse> {
    const run = await this.prisma.payrollBatchRun.findFirst({
      where: { id: jobId, companyId },
    });

    if (!run) {
      throw new NotFoundException(`Batch run ticket "${jobId}" not found.`);
    }

    const percentComplete =
      run.totalEmployees > 0
        ? Math.min(
            100,
            Math.round((run.processedCount / run.totalEmployees) * 100),
          )
        : 100;

    return {
      jobId: run.id,
      status: run.status,
      month: run.month,
      year: run.year,
      totalEmployees: run.totalEmployees,
      processedCount: run.processedCount,
      successCount: run.successCount,
      failureCount: run.failureCount,
      skippedCount: run.skippedCount,
      percentComplete,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      departmentId: run.departmentId,
      errorLog: run.errorLog,
    };
  }

  /**
   * Lists batch run history for a company.
   */
  async listBatchRuns(companyId: string, month?: number, year?: number) {
    return this.prisma.payrollBatchRun.findMany({
      where: {
        companyId,
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
