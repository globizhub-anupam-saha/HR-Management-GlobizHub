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
import {
  PlatformSubscriptionService,
  ALL_HRMS_MODULES,
} from './platform-subscription.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdateEntitlementsDto } from './dto/update-entitlements.dto';
import { AssignSubscriptionDto } from './dto/assign-subscription.dto';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator';
import { CurrentPlatformUser } from '../auth/decorators/current-platform-user.decorator';

@Controller('platform')
@UseGuards(PlatformAuthGuard, PlatformRolesGuard)
export class PlatformSubscriptionController {
  constructor(
    private readonly subscriptionService: PlatformSubscriptionService,
  ) {}

  // Modules metadata
  @Get('modules')
  getModules() {
    return ALL_HRMS_MODULES;
  }

  // Plans CRUD
  @Get('plans')
  async getAllPlans() {
    return this.subscriptionService.getAllPlans();
  }

  @Get('plans/:id')
  async getPlanById(@Param('id') id: string) {
    return this.subscriptionService.getPlanById(id);
  }

  @Post('plans')
  @PlatformRoles('SUPER_ADMIN', 'BILLING_ADMIN')
  async createPlan(
    @Body() dto: CreatePlanDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.subscriptionService.createPlan(
      dto,
      currentUser.id,
      currentUser.email,
    );
  }

  @Put('plans/:id')
  @PlatformRoles('SUPER_ADMIN', 'BILLING_ADMIN')
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.subscriptionService.updatePlan(
      id,
      dto,
      currentUser.id,
      currentUser.email,
    );
  }

  @Put('plans/:id/entitlements')
  @PlatformRoles('SUPER_ADMIN', 'BILLING_ADMIN')
  async updateEntitlements(
    @Param('id') planId: string,
    @Body() dto: UpdateEntitlementsDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.subscriptionService.updateEntitlements(
      planId,
      dto,
      currentUser.id,
      currentUser.email,
    );
  }

  // Subscriptions & Overrides
  @Get('subscriptions/history')
  async getSubscriptionHistory(
    @Query('companyId') companyId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.subscriptionService.getSubscriptionHistory({
      companyId,
      page,
      limit,
    });
  }

  @Get('subscriptions')
  async getAllSubscriptions(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.subscriptionService.getAllSubscriptions({
      search,
      status,
      page,
      limit,
    });
  }

  @Post('subscriptions/assign')
  @PlatformRoles('SUPER_ADMIN', 'BILLING_ADMIN')
  async assignSubscription(
    @Body() dto: AssignSubscriptionDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.subscriptionService.assignOrUpdateSubscription(
      dto,
      currentUser.id,
      currentUser.email,
    );
  }

  @Post('subscriptions/override')
  @PlatformRoles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async setOverride(
    @Body()
    body: {
      companyId: string;
      moduleKey: string;
      isEnabled: boolean;
      reason?: string;
    },
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.subscriptionService.setCompanyOverride(
      body.companyId,
      body.moduleKey,
      body.isEnabled,
      body.reason,
      currentUser.id,
      currentUser.email,
    );
  }

  @Get('subscriptions/override/:companyId')
  async getOverrides(@Param('companyId') companyId: string) {
    return this.subscriptionService.getCompanyOverrides(companyId);
  }
}
