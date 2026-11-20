import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';

@Controller('support')
@UseGuards(AuthGuard, PermissionsGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // Employee: Submit a helpdesk/support ticket
  @Post('tickets')
  async createTicket(@Request() req, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(
      req.user.companyId,
      req.user.sub,
      dto,
    );
  }

  // Employee: View own submitted tickets
  @Get('my-tickets')
  async getMyTickets(@Request() req) {
    return this.supportService.getMyTickets(req.user.companyId, req.user.sub);
  }

  // HR/Admin: View all company tickets
  @Get('tickets')
  @RequirePermissions('system.view')
  async getAllTickets(@Request() req) {
    return this.supportService.getAllCompanyTickets(req.user.companyId);
  }

  // HR/Admin: Update ticket status and resolution notes
  @Patch('tickets/:id/status')
  @RequirePermissions('system.manage')
  async updateTicketStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.supportService.updateTicketStatus(
      req.user.companyId,
      id,
      dto,
      req.user.sub,
    );
  }

  // HR/Admin: SLA metrics & ticket counts
  @Get('stats')
  @RequirePermissions('system.view')
  async getStats(@Request() req) {
    return this.supportService.getTicketStats(req.user.companyId);
  }
}
