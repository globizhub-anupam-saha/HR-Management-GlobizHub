import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlatformSubscriptionCron {
  private readonly logger = new Logger(PlatformSubscriptionCron.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Daily midnight job to evaluate subscription expiries and transition past due accounts
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptionDunning() {
    this.logger.log('Starting daily subscription lifecycle & dunning job...');
    const now = new Date();

    try {
      // 1. Expire Free Trials that have exceeded their trial period
      const expiredTrials = await this.prisma.subscription.findMany({
        where: {
          status: 'TRIAL',
          trialEndsAt: { lt: now },
        },
        include: { company: { select: { id: true, name: true } } },
      });

      for (const sub of expiredTrials) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        });

        await this.prisma.platformAuditLog
          .create({
            data: {
              actorId: null,
              actorEmail: 'system@antigravity.saas',
              actorRole: 'SUPER_ADMIN',
              action: 'SUBSCRIPTION_EXPIRED',
              targetEntity: 'Subscription',
              targetId: sub.id,
              companyId: sub.companyId,
              reason: 'Free Trial period expired without upgrade',
              afterState: {
                companyName: sub.company.name,
                expiredAt: now.toISOString(),
              },
            },
          })
          .catch(() => {});
      }

      if (expiredTrials.length > 0) {
        this.logger.log(
          `Marked ${expiredTrials.length} trial subscription(s) as EXPIRED.`,
        );
      }

      // 2. Mark active subscriptions past currentPeriodEnd as PAST_DUE
      const overdueSubs = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: { lt: now },
        },
        include: { company: { select: { id: true, name: true } } },
      });

      for (const sub of overdueSubs) {
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'PAST_DUE' },
        });

        await this.prisma.platformAuditLog
          .create({
            data: {
              actorId: null,
              actorEmail: 'system@antigravity.saas',
              actorRole: 'SUPER_ADMIN',
              action: 'SUBSCRIPTION_OVERDUE',
              targetEntity: 'Subscription',
              targetId: sub.id,
              companyId: sub.companyId,
              reason: 'Subscription period ended without renewal payment',
              afterState: {
                companyName: sub.company.name,
                flaggedAt: now.toISOString(),
              },
            },
          })
          .catch(() => {});
      }

      if (overdueSubs.length > 0) {
        this.logger.log(
          `Marked ${overdueSubs.length} active subscription(s) as PAST_DUE.`,
        );
      }

      this.logger.log(
        'Daily subscription lifecycle job completed successfully.',
      );
    } catch (err: any) {
      this.logger.error(
        `Error during subscription lifecycle cron: ${err?.message}`,
        err?.stack,
      );
    }
  }
}
