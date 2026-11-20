import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlatformSupportService } from './platform-support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator';
import { CurrentPlatformUser } from '../auth/decorators/current-platform-user.decorator';
import { TicketStatus } from '../../../generated/prisma/enums';

@Controller('platform/support')
@UseGuards(PlatformAuthGuard, PlatformRolesGuard)
export class PlatformSupportController {
  constructor(private readonly supportService: PlatformSupportService) {}

  @Get('tickets')
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('companyId') companyId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.supportService.findAll({
      status,
      priority,
      category,
      companyId,
      search,
      page,
      limit,
    });
  }

  @Get('tickets/:id')
  async findById(@Param('id') id: string) {
    return this.supportService.findById(id);
  }

  @Post('tickets')
  async createTicket(
    @Body() dto: CreateTicketDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.supportService.createTicket(
      dto,
      currentUser.id,
      currentUser.email,
    );
  }

  @Post('tickets/:id/reply')
  async replyTicket(
    @Param('id') id: string,
    @Body() dto: ReplyTicketDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    const actorName =
      `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
      currentUser.email;
    return this.supportService.replyTicket(id, dto, currentUser.id, actorName);
  }

  @Put('tickets/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
    @Body('assigneeId') assigneeId: string,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.supportService.updateStatus(
      id,
      status,
      assigneeId,
      currentUser.id,
      currentUser.email,
    );
  }
}
