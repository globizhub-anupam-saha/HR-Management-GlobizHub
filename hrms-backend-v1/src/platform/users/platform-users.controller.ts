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
import { PlatformUsersService } from './platform-users.service';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { PlatformRolesGuard } from '../auth/guards/platform-roles.guard';
import { PlatformRoles } from '../auth/decorators/platform-roles.decorator';
import { CurrentPlatformUser } from '../auth/decorators/current-platform-user.decorator';
import { PlatformRoleType } from '../../../generated/prisma/enums';

@Controller('platform/users')
@UseGuards(PlatformAuthGuard, PlatformRolesGuard)
export class PlatformUsersController {
  constructor(private readonly usersService: PlatformUsersService) {}

  @Get('roles')
  getRolesMatrix() {
    return this.usersService.getRolesMatrix();
  }

  @Get()
  @PlatformRoles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  async findAll(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll({ search, role, page, limit });
  }

  @Post()
  @PlatformRoles('SUPER_ADMIN')
  async create(
    @Body() dto: CreatePlatformUserDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.usersService.create(dto, currentUser.id, currentUser.email);
  }

  @Put(':id/role')
  @PlatformRoles('SUPER_ADMIN')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: PlatformRoleType,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.usersService.updateRole(
      id,
      role,
      currentUser.id,
      currentUser.email,
    );
  }

  @Put(':id/status')
  @PlatformRoles('SUPER_ADMIN')
  async toggleActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.usersService.toggleActive(
      id,
      isActive,
      currentUser.id,
      currentUser.email,
    );
  }

  @Put(':id/password')
  @PlatformRoles('SUPER_ADMIN')
  async updatePassword(
    @Param('id') id: string,
    @Body('password') password: string,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.usersService.updatePassword(
      id,
      password,
      currentUser.id,
      currentUser.email,
    );
  }

  @Put(':id/profile')
  @PlatformRoles('SUPER_ADMIN')
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: { email?: string; firstName?: string; lastName?: string },
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.usersService.updateProfile(
      id,
      dto,
      currentUser.id,
      currentUser.email,
    );
  }
}
