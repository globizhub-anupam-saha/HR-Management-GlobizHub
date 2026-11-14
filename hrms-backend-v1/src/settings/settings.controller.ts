import {
  Controller,
  Get,
  Put,
  Body,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Request() req) {
    return this.settingsService.getSettings(req.user.companyId);
  }

  @Patch()
  @Put()
  async updateSettings(@Request() req, @Body() dto: any) {
    return this.settingsService.updateSettings(
      req.user.companyId,
      dto,
      req.user.role,
      req.user.sub,
    );
  }
}
