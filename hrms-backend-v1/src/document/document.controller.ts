import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { S3Service } from '../s3/s3.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  DocumentCategory,
  DocumentStatus,
} from '../../generated/prisma/client';
import { RequestDocumentDto } from './dto/request-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { EditDocumentDto } from './dto/edit-document.dto';

@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly storageService: S3Service,
  ) {}

  @Get('me')
  async getMyDocuments(@Request() req) {
    return this.documentService.getMyDocuments(req.user.sub);
  }

  @Get('employee/:id')
  async getEmployeeDocuments(@Request() req, @Param('id') employeeId: string) {
    return this.documentService.getEmployeeDocuments(
      employeeId,
      req.user.role,
      req.user.companyId,
    );
  }

  @Get()
  async getAllDocuments(@Request() req) {
    return this.documentService.getAllDocuments(
      req.user.role,
      req.user.companyId,
    );
  }

  @Post('request')
  async requestDocument(@Request() req, @Body() body: RequestDocumentDto) {
    // Convert string date to Date object if it exists
    const parsedDueDate = body.dueDate ? new Date(body.dueDate) : undefined;
    return this.documentService.requestDocument(
      body.employeeId,
      body.name,
      body.category,
      req.user.sub,
      req.user.role,
      req.user.companyId,
      parsedDueDate,
      body.requestMessage,
    );
  }

  // ==========================================
  // ✅ NEW: PAYSLIP LETTERHEAD ENDPOINTS
  // ==========================================
  // S-10: 5MB limit and image/pdf MIME allowlist for company letterheads
  @Post('payslip-letterhead')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (
          !file.mimetype.match(/^image\/(jpeg|png|webp)|application\/pdf$/i)
        ) {
          return cb(
            new BadRequestException(
              'Only image (JPEG, PNG, WEBP) or PDF files are allowed for company letterheads.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadLetterhead(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    // Security check: only Admins should upload company letterheads
    const isAdmin =
      req.user.role === 'SUPER_ADMIN' ||
      req.user.role === 'HR_HEAD' ||
      req.user.role === 'OWNER';
    if (!isAdmin) {
      throw new ForbiddenException(
        'Only Admins can upload company letterheads.',
      );
    }

    const fileUrl = await this.documentService.uploadPayslipLetterhead(
      file,
      req.user.companyId,
    );

    return { fileUrl, message: 'Letterhead uploaded successfully' };
  }

  @Delete('payslip-letterhead')
  async removeLetterhead(@Request() req) {
    const isAdmin =
      req.user.role === 'SUPER_ADMIN' ||
      req.user.role === 'HR_HEAD' ||
      req.user.role === 'OWNER';
    if (!isAdmin) {
      throw new ForbiddenException(
        'Only Admins can remove company letterheads.',
      );
    }

    await this.documentService.removePayslipLetterhead(req.user.companyId);
    return { message: 'Letterhead removed successfully' };
  }
  // ==========================================

  // S-10: 15MB limit and document/image MIME allowlist
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        const allowed = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only PDF, JPEG, PNG, WEBP, DOC, and DOCX files are allowed for documents.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      documentId?: string;
      employeeId?: string;
      name: string;
      category: DocumentCategory;
    },
  ) {
    if (!file) throw new BadRequestException('File is required');

    // Uploads file and returns the S3 URL (or path)
    const fileUrl = await this.storageService.uploadFile(
      file,
      'employee-documents',
    );

    // Enforce that only Admins can specify employeeId on upload, and set it to null for COMPANY policies
    const isAdmin = ['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(req.user.role);
    const targetEmployeeId =
      body.category === DocumentCategory.COMPANY
        ? null
        : isAdmin
          ? body.employeeId || req.user.sub
          : req.user.sub;

    return this.documentService.uploadDocument(
      body.documentId || null,
      targetEmployeeId,
      fileUrl,
      body.name,
      body.category,
      req.user.sub,
      req.user.role,
      req.user.companyId,
    );
  }

  @Get(':id/details')
  async getDocumentDetails(@Request() req, @Param('id') id: string) {
    return this.documentService.getDocumentById(
      id,
      req.user.sub,
      req.user.role,
      req.user.companyId,
    );
  }

  @Get(':id')
  async getDocumentById(@Request() req, @Param('id') id: string) {
    return this.documentService.getDocumentById(
      id,
      req.user.sub,
      req.user.role,
      req.user.companyId,
    );
  }

  @Post(':id/sign')
  async signDocument(@Request() req, @Param('id') id: string) {
    return this.documentService.signDocument(
      id,
      req.user.sub,
      req.user.companyId,
    );
  }

  // ✅ NEW: Rejection reason added to the payload
  @Patch(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: UpdateDocumentStatusDto,
  ) {
    return this.documentService.updateDocumentStatus(
      id,
      body.status,
      body.rejectionReason || body.reason || null, // Pass to service
      req.user.sub,
      req.user.role,
      req.user.companyId,
    );
  }

  @Delete(':id')
  async deleteDocument(@Request() req, @Param('id') id: string) {
    return this.documentService.deleteDocument(
      id,
      req.user.sub,
      req.user.role,
      req.user.companyId,
    );
  }

  @Patch(':id/details')
  async editDocument(
    @Request() req,
    @Param('id') id: string,
    @Body() body: EditDocumentDto,
  ) {
    return this.documentService.editDocument(
      id,
      body.name,
      body.category,
      body.employeeId || null,
      req.user.sub,
      req.user.role,
      req.user.companyId,
    );
  }
}
