import { Test, TestingModule } from '@nestjs/testing';
import { CredentialService } from './credential.service';
import { PrismaService } from '../prisma/prisma.service';
import { CredentialType } from '../../generated/prisma/enums';

describe('CredentialService - Healthcare Licensing & Compliance Spec', () => {
  let service: CredentialService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      employee: {
        findFirst: jest.fn(),
      },
      professionalCredential: {
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CredentialService>(CredentialService);
  });

  describe('Expiry Status Calculation', () => {
    it('should categorize credentials expiring within 30 days as EXPIRING_SOON', async () => {
      const expiringSoonDate = new Date();
      expiringSoonDate.setDate(expiringSoonDate.getDate() + 20); // 20 days left

      prisma.employee.findFirst.mockResolvedValue({ id: 'doc-1', companyId: 'hosp-1' });
      prisma.professionalCredential.create.mockResolvedValue({
        id: 'cred-1',
        title: 'State Medical Council Registration',
        credentialType: CredentialType.MEDICAL_COUNCIL_REGISTRATION,
        registrationNumber: 'DMC/12345',
        issuingAuthority: 'Delhi Medical Council',
        expiryDate: expiringSoonDate,
        doesNotExpire: false,
        verificationStatus: 'VERIFIED',
      });

      const res = await service.createCredential('hosp-1', 'doc-1', {
        title: 'State Medical Council Registration',
        credentialType: CredentialType.MEDICAL_COUNCIL_REGISTRATION,
        registrationNumber: 'DMC/12345',
        issuingAuthority: 'Delhi Medical Council',
        expiryDate: expiringSoonDate.toISOString(),
      });

      expect(res.credential.status).toBe('EXPIRING_SOON');
      expect(res.credential.daysRemaining).toBeLessThanOrEqual(20);
      expect(res.credential.isCompliant).toBe(true);
    });

    it('should categorize past expiry dates as EXPIRED and non-compliant', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10); // Expired 10 days ago

      prisma.professionalCredential.findMany.mockResolvedValue([
        {
          id: 'cred-expired-1',
          employeeId: 'doc-2',
          title: 'ACLS Certification',
          credentialType: CredentialType.LIFE_SUPPORT_ACLS,
          registrationNumber: 'ACLS-9988',
          issuingAuthority: 'American Heart Association',
          expiryDate: pastDate,
          doesNotExpire: false,
          verificationStatus: 'VERIFIED',
          employee: {
            id: 'doc-2',
            firstName: 'Sarah',
            lastName: 'Connor',
            employeeCode: 'DOC-002',
          },
        },
      ]);

      const dashboard = await service.getComplianceDashboard('hosp-1');
      expect(dashboard.summary.expiredCount).toBe(1);
      expect(dashboard.summary.nonCompliantStaffCount).toBe(1);
      expect(dashboard.urgentAlerts[0].urgency).toBe('EXPIRED');
    });

    it('should handle lifetime permanent licenses without expiry', async () => {
      prisma.professionalCredential.findMany.mockResolvedValue([
        {
          id: 'cred-life',
          employeeId: 'doc-3',
          title: 'Permanent Medical License',
          credentialType: CredentialType.MEDICAL_COUNCIL_REGISTRATION,
          registrationNumber: 'NMC-PERM-555',
          issuingAuthority: 'National Medical Commission',
          expiryDate: null,
          doesNotExpire: true,
          verificationStatus: 'VERIFIED',
        },
      ]);

      const res = await service.getEmployeeCredentials('hosp-1', 'doc-3');
      expect(res[0].status).toBe('LIFETIME');
      expect(res[0].daysRemaining).toBeNull();
      expect(res[0].isCompliant).toBe(true);
    });
  });
});

