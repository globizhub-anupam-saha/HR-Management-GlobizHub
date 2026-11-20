import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Ip,
  Headers,
} from '@nestjs/common';
import { PlatformOrgService } from './platform-org.service';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationStatusDto } from './dto/update-organization-status.dto';
import { CreateAccessSessionDto } from './dto/create-access-session.dto';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator';
import { CurrentPlatformUser } from '../auth/decorators/current-platform-user.decorator';

@Controller('platform/organizations')
@UseGuards(PlatformAuthGuard, PlatformRolesGuard)
export class PlatformOrgController {
  constructor(private readonly orgService: PlatformOrgService) {}

  @Get()
  async getOrganizations(@Query() query: OrganizationQueryDto) {
    return this.orgService.findAll(query);
  }

  @Get(':id')
  async getOrganizationDetails(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }

  @Post()
  @PlatformRoles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.orgService.create(dto, currentUser.id, currentUser.email);
  }

  @Patch(':id/status')
  @PlatformRoles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async updateOrganizationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationStatusDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.orgService.updateStatus(
      id,
      dto,
      currentUser.id,
      currentUser.email,
    );
  }

  @Post(':id/access-session')
  @PlatformRoles('SUPER_ADMIN', 'SUPPORT_ADMIN')
  async createAccessSession(
    @Param('id') id: string,
    @Body() dto: CreateAccessSessionDto,
    @CurrentPlatformUser() currentUser: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.orgService.createAccessSession(
      id,
      dto,
      currentUser.id,
      currentUser.email,
      ip,
      userAgent,
    );
  }
}
