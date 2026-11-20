import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PlatformBillingService } from './platform-billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator';
import { CurrentPlatformUser } from '../auth/decorators/current-platform-user.decorator';
import { InvoiceStatus } from '../../../generated/prisma/enums';

@Controller('platform/billing')
export class PlatformBillingController {
  constructor(private readonly billingService: PlatformBillingService) {}

  // Invoices
  @Get('invoices')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  async getInvoices(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.billingService.getInvoices({
      search,
      status,
      companyId,
      page,
      limit,
    });
  }

  @Get('invoices/:id')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  async getInvoiceById(@Param('id') id: string) {
    return this.billingService.getInvoiceById(id);
  }

  @Post('invoices')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  @PlatformRoles('SUPER_ADMIN', 'BILLING_ADMIN')
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentPlatformUser() user: any,
  ) {
    return this.billingService.createInvoice(dto, user.id, user.email);
  }

  @Put('invoices/:id/status')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  @PlatformRoles('SUPER_ADMIN', 'BILLING_ADMIN')
  async updateInvoiceStatus(
    @Param('id') id: string,
    @Body('status') status: InvoiceStatus,
    @CurrentPlatformUser() user: any,
  ) {
    return this.billingService.updateInvoiceStatus(
      id,
      status,
      user.id,
      user.email,
    );
  }

  // Payments Ledger
  @Get('payments')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  async getPayments(
    @Query('status') status?: string,
    @Query('gateway') gateway?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.billingService.getPayments({ status, gateway, page, limit });
  }

  @Post('payments')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  @PlatformRoles('SUPER_ADMIN', 'BILLING_ADMIN')
  async recordPayment(
    @Body() dto: RecordPaymentDto,
    @CurrentPlatformUser() user: any,
  ) {
    return this.billingService.recordPayment(dto, user.id, user.email);
  }

  // Failed / Dunning
  @Get('failed')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  async getFailedPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.billingService.getFailedPayments({ page, limit });
  }

  // Discount Coupons
  @Get('coupons')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  async getCoupons() {
    return this.billingService.getCoupons();
  }

  @Post('coupons')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  @PlatformRoles('SUPER_ADMIN', 'BILLING_ADMIN')
  async createCoupon(
    @Body()
    body: {
      code: string;
      name: string;
      discountType: 'PERCENTAGE' | 'FIXED';
      discountValue: number;
      validUntil: string;
      maxUsage: number;
      isActive?: boolean;
    },
  ) {
    return this.billingService.createCoupon(body);
  }

  @Delete('coupons/:code')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  @PlatformRoles('SUPER_ADMIN', 'BILLING_ADMIN')
  async deleteCoupon(@Param('code') code: string) {
    return this.billingService.deleteCoupon(code);
  }

  @Post('coupons/validate')
  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  async validateCoupon(@Body() body: { code: string; amount: number }) {
    return this.billingService.validateCoupon(body.code, body.amount);
  }

  // Payment Webhook (Public with Idempotency & Cryptographic Signature Validation)
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') stripeSignature?: string,
    @Headers('x-webhook-signature') webhookSignature?: string,
    @Headers('x-idempotency-key') idempotencyHeader?: string,
  ) {
    const secret =
      process.env.STRIPE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';
    const signature = stripeSignature || webhookSignature;

    if (secret) {
      if (!signature) {
        throw new UnauthorizedException('Missing webhook signature header');
      }
      const rawPayload =
        typeof payload === 'string' ? payload : JSON.stringify(payload);
      const isValid = this.billingService.verifyWebhookSignature(
        rawPayload,
        signature,
        secret,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid webhook signature');
      }
    } else if (isProduction) {
      throw new UnauthorizedException(
        'Webhook secret not configured on server',
      );
    }

    const key = idempotencyHeader || payload?.id;
    if (!key) {
      throw new BadRequestException(
        'Webhook requires a unique event ID or x-idempotency-key',
      );
    }

    const eventType = payload?.type || payload?.event || 'payment.succeeded';
    return this.billingService.handleWebhook(payload, eventType, key);
  }
}
