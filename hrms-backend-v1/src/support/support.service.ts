import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTicketDto, TicketPriority } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Calculate SLA Due Date according to priority:
   * - URGENT: 4 hours
   * - HIGH: 24 hours
   * - MEDIUM: 48 hours
   * - LOW: 72 hours
   */
  private calculateSlaDueDate(priority: TicketPriority): Date {
    const now = new Date();
    const hours =
      priority === TicketPriority.URGENT
        ? 4
        : priority === TicketPriority.HIGH
          ? 24
          : priority === TicketPriority.MEDIUM
            ? 48
            : 72;
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }

  async createTicket(
    companyId: string,
    employeeId: string,
    dto: CreateTicketDto,
  ) {
    const slaDue = this.calculateSlaDueDate(dto.priority);
    const taggedTitle = `[SUPPORT-${dto.category}][${dto.priority}] ${dto.title}`;

    const ticket = await this.prisma.task.create({
      data: {
        companyId,
        employeeId,
        title: taggedTitle,
        description: dto.description,
        status: 'OPEN',
        dueDate: slaDue,
        source: 'MANUAL',
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },
      },
    });

    await this.auditService.logAction(
      companyId,
      employeeId,
      'CREATE',
      'SupportTicket' as any,
      ticket.id,
      null,
      { category: dto.category, priority: dto.priority, title: dto.title },
    );

    return this.formatTicket(ticket);
  }

  async getMyTickets(companyId: string, employeeId: string) {
    const tickets = await this.prisma.task.findMany({
      where: {
        companyId,
        employeeId,
        title: { startsWith: '[SUPPORT-' },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((t) => this.formatTicket(t));
  }

  async getAllCompanyTickets(companyId: string) {
    const tickets = await this.prisma.task.findMany({
      where: {
        companyId,
        title: { startsWith: '[SUPPORT-' },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((t) => this.formatTicket(t));
  }

  async updateTicketStatus(
    companyId: string,
    ticketId: string,
    dto: UpdateTicketStatusDto,
    actorId: string,
  ) {
    const ticket = await this.prisma.task.findFirst({
      where: {
        id: ticketId,
        companyId,
        title: { startsWith: '[SUPPORT-' },
      },
    });

    if (!ticket) throw new NotFoundException('Support ticket not found');

    const updated = await this.prisma.task.update({
      where: { id: ticketId },
      data: {
        status: dto.status,
        ...(dto.resolutionNotes
          ? {
              description: `${ticket.description || ''}\n\n[Resolution Note]: ${dto.resolutionNotes}`,
            }
          : {}),
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },
      },
    });

    await this.auditService.logAction(
      companyId,
      actorId,
      'UPDATE',
      'SupportTicket' as any,
      ticketId,
      { status: ticket.status },
      { status: dto.status },
    );

    return this.formatTicket(updated);
  }

  async getTicketStats(companyId: string) {
    const tickets = await this.prisma.task.findMany({
      where: {
        companyId,
        title: { startsWith: '[SUPPORT-' },
      },
      select: { status: true, dueDate: true },
    });

    const now = new Date();
    let openCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let closedCount = 0;
    let overdueCount = 0;

    for (const t of tickets) {
      if (t.status === 'OPEN') openCount++;
      else if (t.status === 'IN_PROGRESS') inProgressCount++;
      else if (t.status === 'RESOLVED') resolvedCount++;
      else if (t.status === 'CLOSED') closedCount++;

      if (
        ['OPEN', 'IN_PROGRESS'].includes(t.status) &&
        t.dueDate &&
        t.dueDate < now
      ) {
        overdueCount++;
      }
    }

    return {
      total: tickets.length,
      open: openCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      closed: closedCount,
      overdueSla: overdueCount,
    };
  }

  private formatTicket(ticket: any) {
    const match = ticket.title.match(
      /^\[SUPPORT-([^\]]+)\]\[([^\]]+)\]\s*(.*)$/,
    );
    const category = match ? match[1] : 'GENERAL';
    const priority = match ? match[2] : 'MEDIUM';
    const subject = match ? match[3] : ticket.title;
    const isOverdue =
      ['OPEN', 'IN_PROGRESS'].includes(ticket.status) &&
      ticket.dueDate &&
      new Date(ticket.dueDate) < new Date();

    return {
      id: ticket.id,
      ticketNumber: `TICK-${ticket.id.substring(0, 6).toUpperCase()}`,
      subject,
      category,
      priority,
      description: ticket.description,
      status: ticket.status,
      slaDueDate: ticket.dueDate,
      isOverdue,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      creator: ticket.employee
        ? {
            name: `${ticket.employee.firstName} ${ticket.employee.lastName}`.trim(),
            email: ticket.employee.email,
            employeeCode: ticket.employee.employeeCode,
            department: ticket.employee.department?.name || null,
          }
        : null,
    };
  }
}
