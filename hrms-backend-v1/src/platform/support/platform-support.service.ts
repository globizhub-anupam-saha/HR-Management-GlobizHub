import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketStatus, TicketPriority } from '../../../generated/prisma/enums';

@Injectable()
export class PlatformSupportService {
  private readonly logger = new Logger(PlatformSupportService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * List tickets with filters and pagination
   */
  async findAll(query: {
    status?: string;
    priority?: string;
    category?: string;
    companyId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status !== 'ALL') {
      where.status = query.status as TicketStatus;
    }
    if (query.priority && query.priority !== 'ALL') {
      where.priority = query.priority as TicketPriority;
    }
    if (query.category && query.category !== 'ALL') {
      where.category = query.category;
    }
    if (query.companyId) {
      where.companyId = query.companyId;
    }
    if (query.search) {
      where.OR = [
        {
          ticketNumber: { contains: query.search.trim(), mode: 'insensitive' },
        },
        { subject: { contains: query.search.trim(), mode: 'insensitive' } },
        {
          company: {
            name: { contains: query.search.trim(), mode: 'insensitive' },
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, email: true } },
          assignee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: { select: { messages: true } },
        },
      }),
    ]);

    return {
      data: items.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        companyId: t.companyId,
        companyName: t.company.name,
        companyEmail: t.company.email,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        assigneeName: t.assignee
          ? `${t.assignee.firstName} ${t.assignee.lastName}`
          : 'Unassigned',
        messageCount: t._count.messages,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
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
   * Find single ticket with full message thread
   */
  async findById(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, email: true, phone: true } },
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Support ticket not found');
    return ticket;
  }

  /**
   * Create ticket
   */
  async createTicket(
    dto: CreateTicketDto,
    actorId?: string,
    actorEmail?: string,
  ) {
    const count = await this.prisma.supportTicket.count();
    const ticketNumber = `TCK-${(count + 1001).toString()}`;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        companyId: dto.companyId,
        creatorId: dto.creatorId,
        subject: dto.subject,
        category: dto.category,
        priority: dto.priority,
        status: 'OPEN',
        messages: {
          create: {
            senderType: 'EMPLOYEE',
            senderId: dto.creatorId,
            message: dto.initialMessage,
          },
        },
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
            action: 'TICKET_CREATE',
            targetEntity: 'SupportTicket',
            targetId: ticket.id,
            companyId: dto.companyId,
            afterState: { ticketNumber, subject: ticket.subject } as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log ticket creation audit', err),
        );
    }

    return ticket;
  }

  /**
   * Post message reply to ticket from platform support
   */
  async replyTicket(
    id: string,
    dto: ReplyTicketDto,
    actorId: string,
    actorName: string,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('Support ticket not found');

    const newStatus = dto.status || 'IN_PROGRESS';

    const [message] = await Promise.all([
      this.prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderType: 'PLATFORM_USER',
          senderId: actorId,
          senderName: actorName,
          message: dto.message,
          isInternal: dto.isInternal || false,
        },
      }),
      this.prisma.supportTicket.update({
        where: { id },
        data: {
          status: newStatus,
          assigneeId: actorId,
          updatedAt: new Date(),
        },
      }),
    ]);

    return message;
  }

  /**
   * Update ticket status or assignee
   */
  async updateStatus(
    id: string,
    status: TicketStatus,
    assigneeId?: string,
    actorId?: string,
    actorEmail?: string,
  ) {
    const existing = await this.prisma.supportTicket.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Support ticket not found');

    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status,
        assigneeId: assigneeId !== undefined ? assigneeId : existing.assigneeId,
      },
    });

    if (actorId && actorEmail) {
      this.prisma.platformAuditLog
        .create({
          data: {
            actorId,
            actorEmail,
            actorRole: 'SUPPORT_ADMIN',
            action: 'TICKET_STATUS_UPDATE',
            targetEntity: 'SupportTicket',
            targetId: id,
            companyId: existing.companyId,
            beforeState: { status: existing.status } as any,
            afterState: { status: updated.status } as any,
          },
        })
        .catch((err) =>
          this.logger.error('Failed to log ticket status update audit', err),
        );
    }

    return updated;
  }
}
