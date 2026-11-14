import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CredentialService } from './credential.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { VerifyCredentialDto } from './dto/verify-credential.dto';
import { CredentialType } from '../../generated/prisma/enums';

@Controller('credentials')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  async createCredential(@Request() req, @Body() dto: CreateCredentialDto) {
    return this.credentialService.createCredential(
      req.user.companyId,
      req.user.sub,
      dto,
    );
  }

  @Get('my')
  async getMyCredentials(@Request() req) {
    return this.credentialService.getEmployeeCredentials(
      req.user.companyId,
      req.user.sub,
    );
  }

  @Get('compliance-dashboard')
  @RequirePermissions('employee.view')
  async getComplianceDashboard(@Request() req) {
    return this.credentialService.getComplianceDashboard(req.user.companyId);
  }

  @Get('company')
  @RequirePermissions('employee.view')
  async listCompanyCredentials(
    @Request() req,
    @Query('credentialType') credentialType?: CredentialType,
    @Query('verificationStatus') verificationStatus?: string,
    @Query('expiringWithinDays') expiringWithinDays?: string,
    @Query('search') search?: string,
  ) {
    return this.credentialService.listCompanyCredentials(req.user.companyId, {
      credentialType,
      verificationStatus,
      expiringWithinDays: expiringWithinDays
        ? parseInt(expiringWithinDays, 10)
        : undefined,
      search,
    });
  }

  @Get('employee/:employeeId')
  @RequirePermissions('employee.view')
  async getEmployeeCredentials(
    @Request() req,
    @Param('employeeId') employeeId: string,
  ) {
    return this.credentialService.getEmployeeCredentials(
      req.user.companyId,
      employeeId,
    );
  }

  @Put(':id')
  async updateCredential(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateCredentialDto,
  ) {
    return this.credentialService.updateCredential(
      req.user.companyId,
      id,
      dto,
    );
  }

  @Patch(':id/verify')
  @RequirePermissions('employee.manage')
  async verifyCredential(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: VerifyCredentialDto,
  ) {
    return this.credentialService.verifyCredential(
      req.user.companyId,
      id,
      req.user.sub,
      dto,
    );
  }

  @Delete(':id')
  @RequirePermissions('employee.manage')
  async deleteCredential(@Request() req, @Param('id') id: string) {
    return this.credentialService.deleteCredential(req.user.companyId, id);
  }
}

