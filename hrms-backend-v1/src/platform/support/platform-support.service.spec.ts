import { Test, TestingModule } from '@nestjs/testing';
import { PlatformSupportService } from './platform-support.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PlatformSupportService', () => {
  let service: PlatformSupportService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      supportTicket: {
        count: jest.fn().mockResolvedValue(5),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({
          id: 'tck-1',
          ticketNumber: 'TCK-1001',
          status: 'OPEN',
          companyId: 'org-1',
        }),
        create: jest.fn().mockResolvedValue({
          id: 'tck-1',
          ticketNumber: 'TCK-1001',
          subject: 'Payroll Tax calculation issue',
        }),
        update: jest.fn().mockResolvedValue({
          id: 'tck-1',
          status: 'IN_PROGRESS',
        }),
      },
      ticketMessage: {
        create: jest.fn().mockResolvedValue({
          id: 'msg-1',
          message: 'We are investigating this right away.',
        }),
      },
      platformAuditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformSupportService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PlatformSupportService>(PlatformSupportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list support tickets with pagination', async () => {
    const res = await service.findAll({});
    expect(res.meta.total).toBe(5);
  });

  it('should reply to a ticket and update status', async () => {
    const res = await service.replyTicket(
      'tck-1',
      { message: 'We are investigating this right away.' },
      'agent-1',
      'Support Agent',
    );

    expect(prisma.ticketMessage.create).toHaveBeenCalled();
    expect(prisma.supportTicket.update).toHaveBeenCalled();
    expect(res.message).toBe('We are investigating this right away.');
  });
});
