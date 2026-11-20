import { Test, TestingModule } from '@nestjs/testing';
import { PlatformBillingService } from './platform-billing.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PlatformBillingService', () => {
  let service: PlatformBillingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      invoice: {
        count: jest.fn().mockResolvedValue(10),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest
          .fn()
          .mockResolvedValue({ id: 'inv-1', invoiceNumber: 'INV-2026-00001' }),
        update: jest.fn().mockResolvedValue({ id: 'inv-1', status: 'PAID' }),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      payment: {
        count: jest.fn().mockResolvedValue(5),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'pay-1',
          amount: 1500,
          status: 'SUCCEEDED',
        }),
      },
      company: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'org-1', name: 'Acme Corp' }),
      },
      subscription: {
        update: jest.fn().mockResolvedValue({ id: 'sub-1', status: 'ACTIVE' }),
      },
      platformAuditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformBillingService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PlatformBillingService>(PlatformBillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list invoices with meta and summary', async () => {
    prisma.invoice.findMany.mockResolvedValue([
      {
        id: 'inv-1',
        invoiceNumber: 'INV-2026-00001',
        companyId: 'org-1',
        company: { name: 'Acme Corp', email: 'acme@test.com' },
        subscription: { plan: { name: 'Starter' } },
        amountDue: 1499,
        amountPaid: 1499,
        currency: 'INR',
        status: 'PAID',
        dueDate: new Date(),
        paidAt: new Date(),
        pdfUrl: null,
        createdAt: new Date(),
        payments: [{ id: 'p1', amount: 1499, status: 'SUCCEEDED' }],
      },
    ]);

    const res = await service.getInvoices({});
    expect(res.data).toHaveLength(1);
    expect(res.meta.total).toBe(10);
    expect(res.summary).toBeDefined();
  });

  it('should create invoice with sequential number', async () => {
    const res = await service.createInvoice(
      {
        companyId: 'org-1',
        amountDue: 4999,
        dueDate: '2026-12-31T00:00:00.000Z',
      },
      'admin-1',
      'superadmin@globizhr.com',
    );

    expect(prisma.invoice.create).toHaveBeenCalled();
    expect(res.invoiceNumber).toBe('INV-2026-00001');
  });

  it('should record payment idempotently', async () => {
    // If already exists, return existing
    prisma.payment.findUnique.mockResolvedValueOnce({
      id: 'existing-pay',
      idempotencyKey: 'key-123',
    });

    const res = await service.recordPayment({
      invoiceId: 'inv-1',
      amount: 4999,
      gateway: 'STRIPE',
      idempotencyKey: 'key-123',
      status: 'SUCCEEDED',
    });

    expect(res.id).toBe('existing-pay');
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it('should record payment and update invoice if succeeded', async () => {
    prisma.payment.findUnique.mockResolvedValueOnce(null);
    prisma.invoice.findUnique.mockResolvedValueOnce({
      id: 'inv-1',
      amountDue: 4999,
      amountPaid: 0,
      subscriptionId: 'sub-1',
      status: 'ISSUED',
    });

    const res = await service.recordPayment({
      invoiceId: 'inv-1',
      amount: 4999,
      gateway: 'STRIPE',
      idempotencyKey: 'new-key',
      status: 'SUCCEEDED',
    });

    expect(prisma.payment.create).toHaveBeenCalled();
    expect(prisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inv-1' },
        data: expect.objectContaining({ status: 'PAID' }),
      }),
    );
  });
});
