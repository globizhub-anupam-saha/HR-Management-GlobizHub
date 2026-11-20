import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { JobOfferService } from '../services/job-offer.service';
import { CreateJobOfferDto } from '../dto/create-job-offer.dto';
import { ReviseJobOfferDto } from '../dto/revise-job-offer.dto';
import { ReviewJobOfferDto } from '../dto/review-job-offer.dto';
import { RecordOfferResponseDto } from '../dto/record-offer-response.dto';
import { WithdrawOfferDto } from '../dto/withdraw-offer.dto';

@Controller('recruitment')
@UseGuards(AuthGuard)
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  private ensureCanManageOffers(role: string) {
    if (
      ![
        'SUPER_ADMIN',
        'HR_HEAD',
        'OWNER',
        'ADMIN',
        'RECRUITER',
        'MANAGER',
      ].includes(role)
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage recruitment offers.',
      );
    }
  }

  @Post('offers')
  async createOfferDirect(@Request() req, @Body() body: any) {
    this.ensureCanManageOffers(req.user.role);
    const applicationId = body.applicationId || body.candidateApplicationId;
    return this.jobOfferService.createOffer(
      applicationId,
      req.user.companyId,
      req.user.sub,
      body,
    );
  }

  @Post('applications/:applicationId/offer')
  async createOffer(
    @Request() req,
    @Param('applicationId') applicationId: string,
    @Body() dto: CreateJobOfferDto,
  ) {
    this.ensureCanManageOffers(req.user.role);
    return this.jobOfferService.createOffer(
      applicationId,
      req.user.companyId,
      req.user.sub,
      dto,
    );
  }

  @Get('applications/:applicationId/offer')
  async getOfferByApplication(
    @Request() req,
    @Param('applicationId') applicationId: string,
  ) {
    this.ensureCanManageOffers(req.user.role);
    return this.jobOfferService.getOfferByApplication(
      applicationId,
      req.user.companyId,
    );
  }

  @Post('offers/:id/revise')
  async reviseOffer(
    @Request() req,
    @Param('id') offerId: string,
    @Body() dto: ReviseJobOfferDto,
  ) {
    this.ensureCanManageOffers(req.user.role);
    return this.jobOfferService.reviseOffer(
      offerId,
      req.user.companyId,
      req.user.sub,
      dto,
    );
  }

  @Post('offers/:id/submit')
  async submitForApproval(@Request() req, @Param('id') offerId: string) {
    this.ensureCanManageOffers(req.user.role);
    return this.jobOfferService.submitForApproval(
      offerId,
      req.user.companyId,
      req.user.sub,
    );
  }

  @Post('offers/:id/review')
  async reviewOffer(
    @Request() req,
    @Param('id') offerId: string,
    @Body() dto: ReviewJobOfferDto,
  ) {
    const isHrOrAdmin = ['SUPER_ADMIN', 'OWNER', 'HR_HEAD', 'ADMIN'].includes(
      req.user.role,
    );

    if (!isHrOrAdmin) {
      throw new ForbiddenException(
        'Only HR Head, Admin, or Company Owner can approve or reject offer compensation.',
      );
    }

    return this.jobOfferService.reviewOffer(
      offerId,
      req.user.companyId,
      req.user.sub,
      dto,
    );
  }

  @Post('offers/:id/send')
  async sendOffer(@Request() req, @Param('id') offerId: string) {
    this.ensureCanManageOffers(req.user.role);
    return this.jobOfferService.sendOffer(
      offerId,
      req.user.companyId,
      req.user.sub,
    );
  }

  @Post('offers/:id/response')
  async recordCandidateResponse(
    @Request() req,
    @Param('id') offerId: string,
    @Body() dto: RecordOfferResponseDto,
  ) {
    this.ensureCanManageOffers(req.user.role);
    return this.jobOfferService.recordCandidateResponse(
      offerId,
      req.user.companyId,
      req.user.sub,
      dto,
    );
  }

  @Post('offers/:id/withdraw')
  async withdrawOffer(
    @Request() req,
    @Param('id') offerId: string,
    @Body() dto: WithdrawOfferDto,
  ) {
    this.ensureCanManageOffers(req.user.role);
    return this.jobOfferService.withdrawOffer(
      offerId,
      req.user.companyId,
      req.user.sub,
      dto,
    );
  }
}
