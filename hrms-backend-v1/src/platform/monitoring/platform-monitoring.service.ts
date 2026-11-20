import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformMonitoringService {
  private readonly logger = new Logger(PlatformMonitoringService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Comprehensive Platform Audit Trail
   */
  async getAuditLogs(query: {
    search?: string;
    action?: string;
    targetEntity?: string;
    companyId?: string;
    actorEmail?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.action && query.action !== 'ALL') {
      where.action = query.action;
    }
    if (query.targetEntity && query.targetEntity !== 'ALL') {
      where.targetEntity = query.targetEntity;
    }
    if (query.companyId) {
      where.companyId = query.companyId;
    }
    if (query.actorEmail) {
      where.actorEmail = {
        contains: query.actorEmail.trim(),
        mode: 'insensitive',
      };
    }
    if (query.search) {
      where.OR = [
        { action: { contains: query.search.trim(), mode: 'insensitive' } },
        { actorEmail: { contains: query.search.trim(), mode: 'insensitive' } },
        {
          targetEntity: { contains: query.search.trim(), mode: 'insensitive' },
        },
        { reason: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.platformAuditLog.count({ where }),
      this.prisma.platformAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * System Health, Database Connectivity & Resource Telemetry
   */
  async getSystemHealth() {
    const startTime = Date.now();
    let dbStatus = 'HEALTHY';
    let dbLatencyMs = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startTime;
    } catch (err: any) {
      dbStatus = 'DEGRADED';
      dbLatencyMs = -1;
      this.logger.error('Health check DB ping failed', err);
    }

    const mem = process.memoryUsage();
    const uptimeSeconds = process.uptime();

    const [totalTenants, activeTenants, totalEmployees, totalSubscriptions] =
      await Promise.all([
        this.prisma.company.count(),
        this.prisma.company.count({ where: { status: 'VERIFIED' } }),
        this.prisma.employee.count(),
        this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      ]);

    return {
      status: dbStatus === 'HEALTHY' ? 'OPERATIONAL' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(uptimeSeconds),
      uptimeFormatted: this.formatUptime(uptimeSeconds),
      environment: process.env.NODE_ENV || 'production',
      database: {
        engine: 'PostgreSQL (Neon Pooled)',
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      },
      metrics: {
        totalTenants,
        activeTenants,
        totalEmployees,
        totalSubscriptions,
      },
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }
}
