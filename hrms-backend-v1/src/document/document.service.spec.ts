import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  DocumentCategory,
  DocumentStatus,
} from '../../generated/prisma/client';

describe('DocumentService', () => {
  let service: DocumentService;

  const mockPrisma = {
    document: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    companySettings: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockS3 = {
    getPresignedUrl: jest
      .fn()
      .mockImplementation((url) =>
        Promise.resolve(`https://signed.url/${url}`),
      ),
    uploadFile: jest.fn().mockResolvedValue('uploaded-url'),
    deleteFile: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: S3Service, useValue: mockS3 },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('OWNER role authorization across operations', () => {
    it('allows OWNER to request a document from an employee', async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({
        id: 'emp-1',
        companyId: 'comp-100',
      });
      mockPrisma.document.create.mockResolvedValue({
        id: 'doc-1',
        name: 'PAN Card',
        category: DocumentCategory.COMPLIANCE,
        status: DocumentStatus.REQUESTED,
        employeeId: 'emp-1',
        companyId: 'comp-100',
      });
      mockPrisma.notification.create.mockResolvedValue({});

      const result = await service.requestDocument(
        'emp-1',
        'PAN Card',
        DocumentCategory.COMPLIANCE,
        'owner-1',
        'OWNER',
        'comp-100',
      );

      expect(result.id).toBe('doc-1');
      expect(mockPrisma.document.create).toHaveBeenCalled();
      expect(mockPrisma.notification.create).toHaveBeenCalled();
    });

    it('rejects regular EMPLOYEE from requesting a document', async () => {
      await expect(
        service.requestDocument(
          'emp-1',
          'Passport',
          DocumentCategory.COMPLIANCE,
          'emp-2',
          'EMPLOYEE',
          'comp-100',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows OWNER to verify document status and sets rejectionReason when rejected', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        name: 'Passport',
        status: DocumentStatus.SUBMITTED,
        employee: { id: 'emp-1', companyId: 'comp-100' },
      });
      mockPrisma.document.update.mockResolvedValue({
        id: 'doc-1',
        name: 'Passport',
        status: DocumentStatus.REJECTED,
        rejectionReason: 'Blurry copy',
        employeeId: 'emp-1',
        employee: { id: 'emp-1', companyId: 'comp-100' },
      });
      mockPrisma.notification.create.mockResolvedValue({});

      const result = await service.updateDocumentStatus(
        'doc-1',
        DocumentStatus.REJECTED,
        'Blurry copy',
        'owner-1',
        'OWNER',
        'comp-100',
      );

      expect(result.status).toBe(DocumentStatus.REJECTED);
      expect(result.rejectionReason).toBe('Blurry copy');
      expect(mockPrisma.notification.create).toHaveBeenCalled();
    });

    it('allows OWNER to view all company documents', async () => {
      mockPrisma.document.findMany.mockResolvedValue([
        { id: 'doc-1', fileUrl: 'docs/doc1.pdf' },
      ]);

      const result = await service.getAllDocuments('OWNER', 'comp-100');
      expect(result).toHaveLength(1);
      expect(result[0].fileUrl).toBe('https://signed.url/docs/doc1.pdf');
    });

    it('allows OWNER to delete a document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        fileUrl: 'docs/doc1.pdf',
        companyId: 'comp-100',
      });
      mockPrisma.document.delete.mockResolvedValue({ id: 'doc-1' });

      const result = await service.deleteDocument(
        'doc-1',
        'owner-1',
        'OWNER',
        'comp-100',
      );
      expect(result.id).toBe('doc-1');
      expect(mockS3.deleteFile).toHaveBeenCalledWith('docs/doc1.pdf');
    });
  });

  describe('getDocumentById & signDocument', () => {
    it('returns single document with presigned URL for OWNER or employee owner', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        name: 'NDA Agreement',
        fileUrl: 'policies/nda.pdf',
        companyId: 'comp-100',
        employeeId: 'emp-1',
        category: DocumentCategory.EMPLOYMENT,
        employee: {
          id: 'emp-1',
          firstName: 'John',
          lastName: 'Doe',
          companyId: 'comp-100',
        },
      });

      const result = await service.getDocumentById(
        'doc-1',
        'owner-1',
        'OWNER',
        'comp-100',
      );
      expect(result.id).toBe('doc-1');
      expect(result.fileUrl).toBe('https://signed.url/policies/nda.pdf');
    });

    it('allows employee to sign their assigned document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        name: 'Offer Letter',
        fileUrl: 'offer.pdf',
        companyId: 'comp-100',
        employeeId: 'emp-1',
        category: DocumentCategory.EMPLOYMENT,
      });
      mockPrisma.document.update.mockResolvedValue({
        id: 'doc-1',
        name: 'Offer Letter',
        fileUrl: 'offer.pdf',
        isSigned: true,
        signedAt: new Date(),
      });

      const result = await service.signDocument('doc-1', 'emp-1', 'comp-100');
      expect(result.isSigned).toBe(true);
      expect(mockPrisma.document.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isSigned: true }),
        }),
      );
    });

    it('blocks employee from signing another employee document', async () => {
      mockPrisma.document.findUnique.mockResolvedValue({
        id: 'doc-1',
        name: 'Offer Letter',
        fileUrl: 'offer.pdf',
        companyId: 'comp-100',
        employeeId: 'other-emp',
        category: DocumentCategory.EMPLOYMENT,
      });

      await expect(
        service.signDocument('doc-1', 'emp-1', 'comp-100'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
