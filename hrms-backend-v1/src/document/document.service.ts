import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  DocumentCategory,
  DocumentStatus,
} from '../../generated/prisma/client';

import { S3Service } from '../s3/s3.service';

@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  // ==========================================
  // SECURE URL GENERATOR
  // ==========================================
  private async attachSecureUrls(documents: any[]) {
    return Promise.all(
      documents.map(async (doc) => {
        if (doc.fileUrl) {
          doc.fileUrl = await this.s3Service.getPresignedUrl(doc.fileUrl);
        }

        return doc;
      }),
    );
  }

  // ==========================================
  // NEW: PAYSLIP LETTERHEAD (HR ADMIN)
  // ==========================================
  async uploadPayslipLetterhead(
    file: Express.Multer.File,
    companyId: string,
  ): Promise<string> {
    // 1. Validate file type (Block SVGs for security, only allow safe images)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, PNG, and WEBP are allowed.',
      );
    }

    // 2. Max size: 2MB
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File is too large. Maximum size is 2MB.');
    }

    // 3. Fetch the old value before replacing it. Do not delete it yet:
    // the new file and database update must both succeed first.
    const settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });

    // 4. Upload the replacement first, preserving the current letterhead if
    // storage is unavailable.
    const fileUrl = await this.s3Service.uploadFile(
      file,
      `company-${companyId}/letterheads`,
    );

    // 5. Persist the replacement before best-effort cleanup of the old file.
    try {
      await this.prisma.companySettings.upsert({
        where: { companyId },
        update: { payslipHeaderUrl: fileUrl },
        create: { companyId, payslipHeaderUrl: fileUrl },
      });
    } catch (error) {
      // The database still points to the old image, so clean up the newly
      // uploaded object before returning the error.
      try {
        await this.s3Service.deleteFile(fileUrl);
      } catch (cleanupError) {
        console.error('Failed to remove unpersisted letterhead:', cleanupError);
      }
      throw error;
    }

    if (settings?.payslipHeaderUrl && settings.payslipHeaderUrl !== fileUrl) {
      try {
        await this.s3Service.deleteFile(settings.payslipHeaderUrl);
      } catch (error) {
        console.error('Failed to delete replaced letterhead:', error);
      }
    }

    return fileUrl;
  }

  async removePayslipLetterhead(companyId: string): Promise<void> {
    const settings = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });

    if (settings?.payslipHeaderUrl) {
      try {
        await this.s3Service.deleteFile(settings.payslipHeaderUrl);
      } catch (err) {
        console.error('Failed to delete letterhead from storage:', err);
      }

      await this.prisma.companySettings.update({
        where: { companyId },
        data: { payslipHeaderUrl: null },
      });
    }
  }

  // 1. HR ADMIN: Request a document from an employee
  async requestDocument(
    employeeId: string,
    name: string,
    category: DocumentCategory,
    requesterId: string,
    requesterRole: string,
    companyId: string,
    dueDate?: Date,
    requestMessage?: string,
  ) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(requesterRole)) {
      throw new ForbiddenException('Only Admins can request documents.');
    }

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
      select: { companyId: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found in your company');
    }

    const document = await this.prisma.document.create({
      data: {
        name,
        category,
        status: DocumentStatus.REQUESTED,
        employeeId,
        uploadedById: requesterId,
        dueDate,
        requestMessage,
        companyId: employee.companyId,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: employeeId,
        companyId: employee.companyId,
        title: 'Action Required: New Document Request',
        message: `HR has requested you to upload: ${name}. ${dueDate ? `Due by ${new Date(dueDate).toLocaleDateString()}.` : ''}`,
        type: 'DOCUMENT_REQUEST',
      },
    });

    return document;
  }

  // ==========================================
  // 2. EMPLOYEE / HR: Upload a file
  // ==========================================
  async uploadDocument(
    documentId: string | null,
    employeeId: string | null,
    fileUrl: string,
    name: string,
    category: DocumentCategory,
    uploaderId: string,
    uploaderRole: string,
    companyId: string,
  ) {
    const isAdmin = ['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(uploaderRole);

    // A. Upload against an existing document request
    if (documentId) {
      const existing = await this.prisma.document.findUnique({
        where: { id: documentId },
        include: { employee: true },
      });

      if (!existing) {
        throw new NotFoundException('Document request not found');
      }

      if (!isAdmin && existing.employeeId !== uploaderId) {
        throw new ForbiddenException(
          'You cannot upload files for this document request.',
        );
      }

      if (
        isAdmin &&
        existing.employee &&
        existing.employee.companyId !== companyId
      ) {
        throw new ForbiddenException(
          'This document request belongs to an employee of a different company.',
        );
      }

      if (existing.status === DocumentStatus.VERIFIED) {
        throw new ForbiddenException(
          'Verified documents are locked and cannot be re-uploaded.',
        );
      }

      return this.prisma.document.update({
        where: { id: documentId },
        data: {
          fileUrl,
          status: DocumentStatus.SUBMITTED,
          uploadedById: uploaderId,
        },
      });
    }

    // B. Create a new document (voluntary or company policy)
    if (category === DocumentCategory.COMPANY) {
      if (!isAdmin) {
        throw new ForbiddenException(
          'Only Admins can upload company policies.',
        );
      }

      return this.prisma.document.create({
        data: {
          name,
          category,
          fileUrl,
          status: DocumentStatus.VERIFIED, // Policies don't require employee review
          uploadedById: uploaderId,
          companyId,
        },
      });
    }

    // Standard employee document upload
    if (!employeeId) {
      throw new BadRequestException('Target employee is required.');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { companyId: true },
    });

    if (!employee) {
      throw new NotFoundException('Target employee not found');
    }

    if (isAdmin) {
      if (employee.companyId !== companyId) {
        throw new ForbiddenException(
          'Target employee belongs to a different company.',
        );
      }
    } else {
      if (employeeId !== uploaderId) {
        throw new ForbiddenException(
          'You can only upload documents for yourself.',
        );
      }
    }

    return this.prisma.document.create({
      data: {
        name,
        category,
        fileUrl,
        status: DocumentStatus.SUBMITTED,
        employeeId,
        uploadedById: uploaderId,
        companyId: employee.companyId,
      },
    });
  }

  // 3. HR ADMIN: Verify or Reject a submitted document
  async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus,
    rejectionReason: string | null,
    adminId: string,
    userRole: string,
    companyId: string,
  ) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole)) {
      throw new ForbiddenException('Only Admins can verify documents.');
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { employee: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.employee && document.employee.companyId !== companyId) {
      throw new ForbiddenException(
        'This document belongs to an employee of a different company.',
      );
    }

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      },
      include: { employee: true },
    });

    if (status === 'REJECTED' && updated.employeeId && updated.employee) {
      await this.prisma.notification.create({
        data: {
          userId: updated.employeeId,
          companyId: updated.employee.companyId,
          title: 'Document Rejected',
          message: `Your document "${updated.name}" was rejected. Reason: ${rejectionReason}. Please re-upload.`,
          type: 'DOCUMENT_REJECTED',
        },
      });
    }

    return updated;
  }

  // ==========================================
  // 4. EMPLOYEE: Get my documents
  // ==========================================
  async getMyDocuments(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { companyId: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const docs = await this.prisma.document.findMany({
      where: {
        OR: [
          { employeeId },
          {
            category: DocumentCategory.COMPANY,
            companyId: employee.companyId,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.attachSecureUrls(docs);
  }

  // ==========================================
  // 5. HR ADMIN: Get employee documents
  // ==========================================
  async getEmployeeDocuments(
    employeeId: string,
    userRole: string,
    companyId: string,
  ) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole)) {
      throw new ForbiddenException(
        "Only Admins can view other employees' documents.",
      );
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { companyId: true },
    });

    if (!employee || employee.companyId !== companyId) {
      throw new ForbiddenException(
        'Access denied or employee not found in your company.',
      );
    }

    const docs = await this.prisma.document.findMany({
      where: {
        employeeId,
        category: {
          not: DocumentCategory.PERSONAL,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.attachSecureUrls(docs);
  }

  // ==========================================
  // 6. HR ADMIN: Get all documents (pending verification queue)
  // ==========================================
  async getAllDocuments(userRole: string, companyId: string) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole)) {
      throw new ForbiddenException('Only Admins can view all documents.');
    }

    const docs = await this.prisma.document.findMany({
      where: {
        category: {
          not: DocumentCategory.PERSONAL,
        },
        OR: [
          { companyId },
          {
            employee: {
              companyId,
            },
          },
        ],
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.attachSecureUrls(docs);
  }

  // 7. HR ADMIN: Delete a document
  async deleteDocument(
    documentId: string,
    adminId: string,
    userRole: string,
    companyId: string,
  ) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole)) {
      throw new ForbiddenException('Only Admins can delete documents.');
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { employee: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const belongsToCompany =
      document.companyId === companyId ||
      (document.employee && document.employee.companyId === companyId);
    if (!belongsToCompany) {
      throw new ForbiddenException(
        'This document belongs to a different company.',
      );
    }

    // Delete from S3 if file URL exists
    if (document.fileUrl) {
      try {
        await this.s3Service.deleteFile(document.fileUrl);
      } catch (err) {
        console.error(
          `Failed to delete S3 file for document ${documentId}:`,
          err,
        );
      }
    }

    return this.prisma.document.delete({
      where: { id: documentId },
    });
  }

  // 8. HR ADMIN: Edit document metadata
  async editDocument(
    documentId: string,
    name: string,
    category: DocumentCategory,
    employeeId: string | null,
    adminId: string,
    userRole: string,
    companyId: string,
  ) {
    if (!['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole)) {
      throw new ForbiddenException('Only Admins can edit document details.');
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { employee: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const belongsToCompany =
      document.companyId === companyId ||
      (document.employee && document.employee.companyId === companyId);
    if (!belongsToCompany) {
      throw new ForbiddenException(
        'This document belongs to a different company.',
      );
    }

    let targetEmployeeId = employeeId;
    let targetCompanyId = document.companyId;

    if (category === DocumentCategory.COMPANY) {
      targetEmployeeId = null;
      targetCompanyId = companyId;
    } else {
      if (!employeeId) {
        throw new BadRequestException('Target employee is required.');
      }
      const employee = await this.prisma.employee.findUnique({
        where: { id: employeeId },
        select: { companyId: true },
      });
      if (!employee || employee.companyId !== companyId) {
        throw new ForbiddenException(
          'Target employee belongs to a different company or does not exist.',
        );
      }
      targetCompanyId = employee.companyId;
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        name,
        category,
        employeeId: targetEmployeeId,
        companyId: targetCompanyId,
      },
    });
  }

  // ==========================================
  // 9. Single Document Details
  // ==========================================
  async getDocumentById(
    documentId: string,
    userId: string,
    userRole: string,
    companyId: string,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            companyId: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const docCompanyId = document.companyId || document.employee?.companyId;
    if (docCompanyId && docCompanyId !== companyId) {
      throw new ForbiddenException('Access denied to this document.');
    }

    const isPrivileged = ['SUPER_ADMIN', 'HR_HEAD', 'OWNER'].includes(userRole);
    const isOwner = document.employeeId === userId;
    const isCompanyDoc = document.category === DocumentCategory.COMPANY;

    if (!isPrivileged && !isOwner && !isCompanyDoc) {
      throw new ForbiddenException(
        'You are not authorized to view this document.',
      );
    }

    const docs = await this.attachSecureUrls([document]);
    return docs[0];
  }

  // ==========================================
  // 10. E-Signature / Acknowledgement
  // ==========================================
  async signDocument(documentId: string, userId: string, companyId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { employee: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const docCompanyId = document.companyId || document.employee?.companyId;
    if (docCompanyId && docCompanyId !== companyId) {
      throw new ForbiddenException('Document does not belong to your company.');
    }

    const isAssigned = document.employeeId === userId;
    const isCompanyPolicy = document.category === DocumentCategory.COMPANY;

    if (!isAssigned && !isCompanyPolicy) {
      throw new ForbiddenException(
        'You are not authorized to sign this document.',
      );
    }

    // P0 Multi-Tenant / Multi-Employee Safety:
    // If this is a shared company policy with no specific employeeId, record an individual acknowledgement
    // instead of mutating the shared template row for the entire company.
    if (isCompanyPolicy && !document.employeeId) {
      const existingAck = await this.prisma.document.findFirst({
        where: {
          companyId,
          employeeId: userId,
          category: DocumentCategory.COMPANY,
          name: document.name,
          isSigned: true,
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      });

      if (existingAck) {
        const docs = await this.attachSecureUrls([existingAck]);
        return docs[0];
      }

      const ackDoc = await this.prisma.document.create({
        data: {
          name: document.name,
          category: DocumentCategory.COMPANY,
          status: DocumentStatus.VERIFIED,
          fileUrl: document.fileUrl,
          requiresSign: true,
          isSigned: true,
          signedAt: new Date(),
          employeeId: userId,
          companyId,
          uploadedById: document.uploadedById,
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      });

      const docs = await this.attachSecureUrls([ackDoc]);
      return docs[0];
    }

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        isSigned: true,
        signedAt: new Date(),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    const docs = await this.attachSecureUrls([updated]);
    return docs[0];
  }
}
