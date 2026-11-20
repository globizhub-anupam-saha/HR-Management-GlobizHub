import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { InvoiceStatus, PaymentStatus } from '../../../generated/prisma/enums';

export interface PlatformCoupon {
  id: string;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  validUntil: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
  createdAt: string;
}

@Injectable()
export class PlatformBillingService implements OnModuleInit {
  private readonly logger = new Logger(PlatformBillingService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultCoupons();
  }

  /**
   * Seed default platform coupons if none exist
   */
  async seedDefaultCoupons() {
    try {
      const existing = await this.prisma.platformFeatureFlag.count({
        where: { key: { startsWith: 'coupon_' } },
      });
      if (existing > 0) return;

      const defaultCoupons = [
        {
          code: 'LAUNCH50',
          name: 'Early Adopter SaaS Special',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          validUntil: '2026-12-31',
          maxUsage: 100,
          isActive: true,
        },
        {
          code: 'STARTUP_ANNUAL',
          name: 'Annual Upfront Commitment',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          validUntil: '2027-06-30',
          maxUsage: 50,
          isActive: true,
        },
        {
          code: 'ENTERPRISE_PILOT',
          name: 'Dedicated Enterprise Pilot Credit',
          discountType: 'FIXED',
          discountValue: 5000,
          validUntil: '2026-11-30',
          maxUsage: 10,
          isActive: false,
        },
      ];

      for (const c of defaultCoupons) {
        await this.prisma.platformFeatureFlag.create({
          data: {
            key: `coupon_${c.code.toUpperCase()}`,
            name: c.name,
            description: JSON.stringify({
              code: c.code.toUpperCase(),
              name: c.name,
              discountType: c.discountType,
              discountValue: c.discountValue,
              validUntil: c.validUntil,
              maxUsage: c.maxUsage,
              usageCount: 0,
            }),
            isEnabled: c.isActive,
          },
        });
      }
      this.logger.log('Default platform discount coupons seeded.');
    } catch (err: any) {
      this.logger.warn(`Could not seed default coupons: ${err.message}`);
    }
  }

  /**
   * List invoices with metrics, filtering and pagination
   */
  async getInvoices(query: {
    search?: string;
    status?: string;
    companyId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status !== 'ALL') {
      where.status = query.status as InvoiceStatus;
    }
    if (query.companyId) {
      where.companyId = query.companyId;
    }
    if (query.search) {
      where.OR = [
        {
          invoiceNumber: { contains: query.search.trim(), mode: 'insensitive' },
        },
        {
          company: {
            name: { contains: query.search.trim(), mode: 'insensitive' },
          },
        },
      ];
    }

    const [total, items, aggregations] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { id: true, name: true, email: true },
          },
          subscription: {
            select: { id: true, plan: { select: { name: true, code: true } } },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              gateway: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        _sum: { amountDue: true, amountPaid: true },
      }),
    ]);

    let totalDue = 0;
    let totalPaid = 0;
    let totalOverdue = 0;

    for (const agg of aggregations) {
      const due = Number(agg._sum.amountDue || 0);
      const paid = Number(agg._sum.amountPaid || 0);
      totalDue += due;
      totalPaid += paid;
      if (agg.status === 'ISSUED') {
        totalOverdue += due - paid;
      }
    }

    return {
      data: items.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        companyId: inv.companyId,
        companyName: inv.company.name,
        companyEmail: inv.company.email,
        planName: inv.subscription?.plan?.name || 'Custom SaaS Plan',
        amountDue: Number(inv.amountDue),
        amountPaid: Number(inv.amountPaid),
        currency: inv.currency,
        status: inv.status,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        pdfUrl: inv.pdfUrl,
        createdAt: inv.createdAt,
        paymentCount: inv.payments.length,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalInvoiced: totalDue,
        totalCollected: totalPaid,
        totalOutstanding: Math.max(0, totalDue - totalPaid),
      },
    };
  }

  /**
   * Get single invoice with detailed audit & payment transactions
   */
  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            gstin: true,
            pan: true,
            city: true,
            state: true,
            country: true,
            pincode: true,
          },
        },
        subscription: {
          include: { plan: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    return {
      ...invoice,
      amountDue: Number(invoice.amountDue),
      amountPaid: Number(invoice.amountPaid),
    };
  }

  /**
   * Generate a manual or subscription-triggered invoice
   */
  async createInvoice(
    dto: CreateInvoiceDto,
    actorId?: string,
    actorEmail?: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) throw new NotFoundException('Target company not found');

    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(5, '0')}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        companyId: dto.companyId,
        subscriptionId: dto.subscriptionId || null,
        amountDue: dto.amountDue,
        currency: dto.currency || 'INR',
        dueDate: new Date(dto.dueDate),
        status: 'ISSUED',
      },
      include: { company: true },
    });

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action: 'INVOICE_CREATE',
            targetEntity: 'Invoice',
            targetId: invoice.id,
            companyId: dto.companyId,
            afterState: { invoiceNumber, amountDue: dto.amountDue } as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log invoice creation audit', err),
        );
    }

    return invoice;
  }

  /**
   * Update invoice status (PAID, VOID, ISSUED, UNCOLLECTIBLE)
   */
  async updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
    actorId?: string,
    actorEmail?: string,
  ) {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Invoice not found');

    const isPaid = status === 'PAID';
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: isPaid ? new Date() : null,
        amountPaid: isPaid ? existing.amountDue : existing.amountPaid,
      },
    });

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action: 'INVOICE_STATUS_UPDATE',
            targetEntity: 'Invoice',
            targetId: id,
            companyId: existing.companyId,
            beforeState: { status: existing.status } as any,
            afterState: { status: updated.status } as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log invoice status update audit', err),
        );
    }

    return updated;
  }

  /**
   * Record a payment transaction with idempotency protection
   */
  async recordPayment(
    dto: RecordPaymentDto,
    actorId?: string,
    actorEmail?: string,
  ) {
    // Check idempotency key to prevent duplicate payment processing
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existingPayment) {
      return existingPayment;
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found for payment');

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        amount: dto.amount,
        currency: dto.currency || 'INR',
        gateway: dto.gateway,
        gatewayPaymentId: dto.gatewayPaymentId || null,
        idempotencyKey: dto.idempotencyKey,
        status: dto.status as PaymentStatus,
        failureReason: dto.failureReason || null,
      },
    });

    // If payment succeeded, update invoice paid amount and check for completion
    if (dto.status === 'SUCCEEDED') {
      const newPaid = Number(invoice.amountPaid) + Number(dto.amount);
      const isFullyPaid = newPaid >= Number(invoice.amountDue);

      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newPaid,
          status: isFullyPaid ? 'PAID' : invoice.status,
          paidAt: isFullyPaid ? new Date() : invoice.paidAt,
        },
      });

      // Also ensure subscription status is ACTIVE if tied to a subscription
      if (invoice.subscriptionId) {
        await this.prisma.subscription.update({
          where: { id: invoice.subscriptionId },
          data: { status: 'ACTIVE' },
        });
      }
    }

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPER_ADMIN',
            action: 'PAYMENT_RECORD',
            targetEntity: 'Payment',
            targetId: payment.id,
            companyId: invoice.companyId,
            afterState: payment as any,
          },
        })
        .catch((err) => this.logger.error('Failed to log payment audit', err));
    }

    return payment;
  }

  /**
   * List payments ledger
   */
  async getPayments(query: {
    status?: string;
    gateway?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status !== 'ALL') {
      where.status = query.status as PaymentStatus;
    }
    if (query.gateway && query.gateway !== 'ALL') {
      where.gateway = query.gateway;
    }

    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              company: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items.map((p) => ({
        id: p.id,
        invoiceId: p.invoiceId,
        invoiceNumber: p.invoice.invoiceNumber,
        companyId: p.invoice.company.id,
        companyName: p.invoice.company.name,
        companyEmail: p.invoice.company.email,
        amount: Number(p.amount),
        currency: p.currency,
        gateway: p.gateway,
        gatewayPaymentId: p.gatewayPaymentId,
        idempotencyKey: p.idempotencyKey,
        status: p.status,
        failureReason: p.failureReason,
        createdAt: p.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Failed payments & Dunning queue
   */
  async getFailedPayments(query: { page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { status: 'FAILED' as PaymentStatus },
        {
          invoice: {
            status: 'ISSUED' as InvoiceStatus,
            dueDate: { lt: new Date() },
          },
        },
      ],
    };

    const [total, items] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: {
            include: {
              company: {
                select: { id: true, name: true, email: true, phone: true },
              },
              subscription: { include: { plan: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: items.map((p) => ({
        id: p.id,
        invoiceNumber: p.invoice.invoiceNumber,
        companyName: p.invoice.company.name,
        companyEmail: p.invoice.company.email,
        companyPhone: p.invoice.company.phone,
        planName: p.invoice.subscription?.plan?.name || 'Standard',
        amount: Number(p.amount),
        currency: p.currency,
        gateway: p.gateway,
        status: p.status,
        failureReason:
          p.failureReason || 'Invoice overdue without confirmed payment',
        dueDate: p.invoice.dueDate,
        createdAt: p.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cryptographically verify webhook signature against configured secret
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    try {
      if (signature.includes('t=') && signature.includes('v1=')) {
        const parts = signature.split(',').reduce(
          (acc, curr) => {
            const [k, v] = curr.split('=');
            if (k && v) acc[k.trim()] = v.trim();
            return acc;
          },
          {} as Record<string, string>,
        );

        const timestamp = parts['t'];
        const v1 = parts['v1'];
        if (!timestamp || !v1) return false;

        const signedPayload = `${timestamp}.${payload}`;
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(signedPayload)
          .digest('hex');

        const v1Buf = Buffer.from(v1, 'utf8');
        const expBuf = Buffer.from(expectedSignature, 'utf8');
        return (
          v1Buf.length === expBuf.length &&
          crypto.timingSafeEqual(v1Buf, expBuf)
        );
      }

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const sigBuf = Buffer.from(signature, 'utf8');
      const expBuf = Buffer.from(expectedSignature, 'utf8');
      return (
        sigBuf.length === expBuf.length &&
        crypto.timingSafeEqual(sigBuf, expBuf)
      );
    } catch {
      return false;
    }
  }

  /**
   * Idempotent payment webhook receiver (Stripe / Razorpay)
   */
  async handleWebhook(payload: any, eventType: string, idempotencyKey: string) {
    this.logger.log(
      `Received webhook event: ${eventType} with key: ${idempotencyKey}`,
    );

    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return { status: 'already_processed', paymentId: existing.id };
    }

    // In a live integration, event payload contains invoice_id / metadata
    const invoiceId =
      payload?.data?.object?.metadata?.invoiceId || payload?.invoiceId;
    if (!invoiceId) {
      return { status: 'ignored', reason: 'No invoiceId in metadata' };
    }

    const amount =
      Number(payload?.data?.object?.amount || payload?.amount || 0) / 100;
    const isSuccess =
      eventType.includes('succeeded') || eventType.includes('captured');

    const payment = await this.recordPayment({
      invoiceId,
      amount,
      currency: payload?.currency || 'INR',
      gateway: payload?.gateway || 'STRIPE',
      gatewayPaymentId: payload?.data?.object?.id || payload?.paymentId,
      idempotencyKey,
      status: isSuccess ? 'SUCCEEDED' : 'FAILED',
      failureReason: isSuccess
        ? undefined
        : 'Webhook indicated transaction failure',
    });

    return { status: 'processed', paymentId: payment.id };
  }

  /**
   * List all discount coupons
   */
  async getCoupons(): Promise<PlatformCoupon[]> {
    const records = await this.prisma.platformFeatureFlag.findMany({
      where: { key: { startsWith: 'coupon_' } },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => {
      let meta: any = {};
      try {
        meta = r.description ? JSON.parse(r.description) : {};
      } catch {
        meta = {};
      }

      return {
        id: r.id,
        code: meta.code || r.key.replace('coupon_', ''),
        name: r.name,
        discountType: meta.discountType || 'PERCENTAGE',
        discountValue: Number(meta.discountValue || 0),
        validUntil:
          meta.validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
        usageCount: Number(meta.usageCount || 0),
        maxUsage: Number(meta.maxUsage || 100),
        isActive: r.isEnabled,
        createdAt: r.createdAt.toISOString(),
      };
    });
  }

  /**
   * Create a new discount coupon
   */
  async createCoupon(dto: {
    code: string;
    name: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    validUntil: string;
    maxUsage: number;
    isActive?: boolean;
  }) {
    const normalizedCode = dto.code.trim().toUpperCase();
    const key = `coupon_${normalizedCode}`;

    const existing = await this.prisma.platformFeatureFlag.findUnique({
      where: { key },
    });
    if (existing) {
      throw new ConflictException(
        `Coupon code "${normalizedCode}" already exists.`,
      );
    }

    const record = await this.prisma.platformFeatureFlag.create({
      data: {
        key,
        name: dto.name,
        description: JSON.stringify({
          code: normalizedCode,
          name: dto.name,
          discountType: dto.discountType,
          discountValue: dto.discountValue,
          validUntil: dto.validUntil,
          maxUsage: dto.maxUsage,
          usageCount: 0,
        }),
        isEnabled: dto.isActive !== false,
      },
    });

    return {
      id: record.id,
      code: normalizedCode,
      name: record.name,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      validUntil: dto.validUntil,
      usageCount: 0,
      maxUsage: dto.maxUsage,
      isActive: record.isEnabled,
      createdAt: record.createdAt.toISOString(),
    };
  }

  /**
   * Delete or archive a discount coupon
   */
  async deleteCoupon(code: string) {
    const normalizedCode = code.trim().toUpperCase();
    const key = `coupon_${normalizedCode}`;
    const existing = await this.prisma.platformFeatureFlag.findUnique({
      where: { key },
    });
    if (!existing) {
      throw new NotFoundException(`Coupon "${normalizedCode}" not found.`);
    }

    await this.prisma.platformFeatureFlag.delete({
      where: { key },
    });

    return {
      success: true,
      message: `Coupon "${normalizedCode}" deleted successfully.`,
    };
  }

  /**
   * Validate coupon and calculate applied discount
   */
  async validateCoupon(code: string, amount: number) {
    const normalizedCode = code.trim().toUpperCase();
    const key = `coupon_${normalizedCode}`;
    const record = await this.prisma.platformFeatureFlag.findUnique({
      where: { key },
    });

    if (!record || !record.isEnabled) {
      throw new BadRequestException('Invalid or inactive coupon code.');
    }

    let meta: any = {};
    try {
      meta = record.description ? JSON.parse(record.description) : {};
    } catch {
      meta = {};
    }

    if (meta.validUntil && new Date(meta.validUntil).getTime() < Date.now()) {
      throw new BadRequestException('This coupon has expired.');
    }

    if (meta.maxUsage && (meta.usageCount || 0) >= meta.maxUsage) {
      throw new BadRequestException(
        'This coupon has reached its maximum usage limit.',
      );
    }

    let discountAmount = 0;
    if (meta.discountType === 'PERCENTAGE') {
      discountAmount = (amount * Number(meta.discountValue)) / 100;
    } else {
      discountAmount = Number(meta.discountValue);
    }

    discountAmount = Math.min(amount, Math.max(0, discountAmount));
    const finalAmount = Math.max(0, amount - discountAmount);

    return {
      code: normalizedCode,
      name: record.name,
      discountType: meta.discountType,
      discountValue: Number(meta.discountValue),
      discountAmount: Number(discountAmount.toFixed(2)),
      originalAmount: amount,
      finalAmount: Number(finalAmount.toFixed(2)),
    };
  }
}
