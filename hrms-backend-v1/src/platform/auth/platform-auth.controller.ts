import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
} from '@nestjs/common';
import { PlatformAuthService } from './platform-auth.service';
import { PlatformLoginDto } from './dto/platform-login.dto';
import { PlatformRegisterDto } from './dto/platform-register.dto';
import { PlatformAuthGuard } from './guards/platform-auth.guard';
import { PlatformRolesGuard } from './guards/platform-roles.guard';
import { PlatformRoles } from './decorators/platform-roles.decorator';
import { CurrentPlatformUser } from './decorators/current-platform-user.decorator';

@Controller('platform/auth')
export class PlatformAuthController {
  constructor(private readonly authService: PlatformAuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: PlatformLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(dto, ip, userAgent);
  }

  @UseGuards(PlatformAuthGuard)
  @Get('me')
  async getProfile(@CurrentPlatformUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(PlatformAuthGuard, PlatformRolesGuard)
  @PlatformRoles('SUPER_ADMIN')
  @Post('users')
  async createPlatformUser(
    @Body() dto: PlatformRegisterDto,
    @CurrentPlatformUser() currentUser: any,
  ) {
    return this.authService.register(dto, currentUser.id, currentUser.email);
  }
}
