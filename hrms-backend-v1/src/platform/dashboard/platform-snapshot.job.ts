import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformSnapshotJob implements OnModuleInit {
  private readonly logger = new Logger(PlatformSnapshotJob.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed initial historical snapshots if empty so analytics charts show meaningful trends
    await this.seedHistoricalSnapshotsIfEmpty();
  }

  /**
   * Nightly cron job running at midnight UTC to take an idempotent platform snapshot
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySnapshot() {
    this.logger.log(
      'Executing nightly Platform SaaS daily snapshot job (UTC Midnight)...',
    );
    const today = new Date();
    await this.captureSnapshotForDate(today);
  }

  /**
   * Idempotent snapshot capture for a specific date
   */
  async captureSnapshotForDate(date: Date) {
    const startOfDay = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    const endOfDay = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    try {
      // 1. Organization Counts
      const [totalOrganizations, activeOrganizations] = await Promise.all([
        this.prisma.company.count({
          where: { createdAt: { lte: endOfDay } },
        }),
        this.prisma.company.count({
          where: {
            status: 'VERIFIED',
            createdAt: { lte: endOfDay },
          },
        }),
      ]);

      // 2. Employee Counts
      const [totalEmployees, activeEmployees] = await Promise.all([
        this.prisma.employee.count({
          where: { createdAt: { lte: endOfDay } },
        }),
        this.prisma.employee.count({
          where: {
            employmentStatus: 'ACTIVE',
            company: { status: 'VERIFIED' },
            createdAt: { lte: endOfDay },
          },
        }),
      ]);

      // 3. Subscriptions & MRR / ARR calculation
      const activeSubscriptionsList = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          createdAt: { lte: endOfDay },
        },
        include: { plan: true },
      });

      let mrrTotal = 0;
      for (const sub of activeSubscriptionsList) {
        const monthly = Number(sub.plan.monthlyPrice) || 0;
        const annual = Number(sub.plan.annualPrice) || 0;
        if (sub.billingCycle === 'ANNUAL' && annual > 0) {
          mrrTotal += annual / 12;
        } else {
          mrrTotal += monthly;
        }
      }
      const arrTotal = mrrTotal * 12;

      // 4. Subscription Breakdown
      const [activeSubCount, trialSubCount, churnedCount] = await Promise.all([
        this.prisma.subscription.count({
          where: { status: 'ACTIVE', createdAt: { lte: endOfDay } },
        }),
        this.prisma.subscription.count({
          where: { status: 'TRIAL', createdAt: { lte: endOfDay } },
        }),
        this.prisma.subscription.count({
          where: { status: 'CANCELLED', createdAt: { lte: endOfDay } },
        }),
      ]);

      // 5. Collected Revenue
      const payments = await this.prisma.payment.aggregate({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        _sum: { amount: true },
      });
      const collectedRevenue = Number(payments._sum.amount) || 0;

      // 6. Idempotent Upsert into DailyPlatformSnapshot
      const snapshot = await this.prisma.dailyPlatformSnapshot.upsert({
        where: { snapshotDate: startOfDay },
        update: {
          totalOrganizations,
          activeOrganizations,
          totalEmployees,
          activeEmployees,
          mrr: mrrTotal,
          arr: arrTotal,
          collectedRevenue,
          activeSubscriptions: activeSubCount,
          trialSubscriptions: trialSubCount,
          churnedCount,
        },
        create: {
          snapshotDate: startOfDay,
          totalOrganizations,
          activeOrganizations,
          totalEmployees,
          activeEmployees,
          mrr: mrrTotal,
          arr: arrTotal,
          collectedRevenue,
          activeSubscriptions: activeSubCount,
          trialSubscriptions: trialSubCount,
          churnedCount,
          storageBytesUsed: BigInt(totalOrganizations * 50 * 1024 * 1024), // estimated baseline
        },
      });

      this.logger.log(
        `Idempotent snapshot saved for date ${startOfDay.toISOString().split('T')[0]}: Orgs=${totalOrganizations}, MRR=₹${mrrTotal.toFixed(2)}`,
      );

      return snapshot;
    } catch (err: any) {
      this.logger.error(
        `Failed to capture daily snapshot: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Seed historical snapshots for past 30 days if table is empty
   */
  async seedHistoricalSnapshotsIfEmpty() {
    try {
      const count = await this.prisma.dailyPlatformSnapshot.count();
      if (count === 0) {
        this.logger.log(
          'Generating initial 30-day historical snapshot baseline...',
        );
        const today = new Date();
        for (let i = 30; i >= 0; i--) {
          const pastDate = new Date(today);
          pastDate.setDate(today.getDate() - i);
          await this.captureSnapshotForDate(pastDate);
        }
        this.logger.log(
          'Historical 30-day snapshot baseline generated successfully.',
        );
      }
    } catch (err: any) {
      this.logger.warn(`Could not seed historical snapshots: ${err.message}`);
    }
  }
}
