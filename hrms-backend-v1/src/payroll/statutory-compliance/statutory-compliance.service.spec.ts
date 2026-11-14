import { EpfoCalculatorService } from './epfo/epfo-calculator.service';
import { EpfoEcrGeneratorService } from './epfo/epfo-ecr-generator.service';
import { EsicCalculatorService } from './esic/esic-calculator.service';
import { EsicFileGeneratorService } from './esic/esic-file-generator.service';
import { DEFAULT_STATUTORY_RATES } from './common/statutory-rules.service';

describe('StatutoryCompliance Services', () => {
  let epfoCalculator: EpfoCalculatorService;
  let epfoGenerator: EpfoEcrGeneratorService;
  let esicCalculator: EsicCalculatorService;
  let esicGenerator: EsicFileGeneratorService;

  beforeEach(() => {
    epfoCalculator = new EpfoCalculatorService();
    epfoGenerator = new EpfoEcrGeneratorService();
    esicCalculator = new EsicCalculatorService();
    esicGenerator = new EsicFileGeneratorService();
  });

  describe('EpfoCalculatorService', () => {
    it('should correctly calculate EPFO contributions capped at statutory ceiling 15,000', () => {
      const result = epfoCalculator.calculateMember({
        uan: '100123456789',
        memberName: 'Rahul Sharma',
        grossSalary: 45000,
        basicSalary: 25000, // exceeds 15,000 ceiling
        unpaidLeaves: 2,
        totalWorkingDays: 30,
        rates: DEFAULT_STATUTORY_RATES,
      });

      expect(result.uan).toBe('100123456789');
      expect(result.epfWages).toBe(15000);
      expect(result.epsWages).toBe(15000);
      expect(result.edliWages).toBe(15000);
      expect(result.eeEpfShare).toBe(1800); // 12% of 15,000
      expect(result.erEpsShare).toBe(1250); // 8.33% capped at 1,250
      expect(result.erEpfDiff).toBe(550);   // 1800 - 1250
      expect(result.ncpDays).toBe(2);
    });

    it('should set EPS wages to 0 if employee is 58 years or older', () => {
      const result = epfoCalculator.calculateMember({
        uan: '100123456789',
        memberName: 'Senior Citizen',
        grossSalary: 30000,
        basicSalary: 14000,
        unpaidLeaves: 0,
        totalWorkingDays: 30,
        rates: DEFAULT_STATUTORY_RATES,
        age: 60,
      });

      expect(result.epfWages).toBe(14000);
      expect(result.epsWages).toBe(0);
      expect(result.erEpsShare).toBe(0);
      expect(result.erEpfDiff).toBe(1680); // Entire 12% goes to EPF
    });
  });

  describe('EpfoEcrGeneratorService', () => {
    it('should generate official #~# delimited ECR .txt layout and calculate aggregate accounts', () => {
      const records = [
        {
          uan: '100123456789',
          memberName: 'Rahul Sharma',
          grossWages: 45000,
          epfWages: 15000,
          epsWages: 15000,
          edliWages: 15000,
          eeEpfShare: 1800,
          erEpsShare: 1250,
          erEpfDiff: 550,
          ncpDays: 2,
          refundOfAdvances: 0,
        },
      ];

      const ecr = epfoGenerator.generateEcrText(records);

      expect(ecr.content).toContain('100123456789#~#Rahul Sharma#~#45000#~#15000#~#15000#~#15000#~#1800#~#1250#~#550#~#2#~#0');
      expect(ecr.memberCount).toBe(1);
      expect(ecr.totalAdminCharges).toBe(500); // Minimum 500
      expect(ecr.totalEdliContribution).toBe(75); // 0.5% of 15,000
    });
  });

  describe('EsicCalculatorService', () => {
    it('should correctly calculate ESIC contributions for wage below ceiling 21,000', () => {
      const result = esicCalculator.calculateMember({
        ipNumber: '1122334455',
        ipName: 'Pooja Verma',
        grossSalary: 18000,
        totalWorkingDays: 30,
        presentDays: 28,
        unpaidLeaves: 2,
        rates: DEFAULT_STATUTORY_RATES,
      });

      expect(result).not.toBeNull();
      expect(result?.eeContribution).toBe(135); // 0.75% of 18,000
      expect(result?.erContribution).toBe(585); // 3.25% of 18,000
      expect(result?.totalContribution).toBe(720);
    });

    it('should return null if gross wage exceeds 21,000 ceiling', () => {
      const result = esicCalculator.calculateMember({
        ipNumber: '1122334455',
        ipName: 'Amit Patel',
        grossSalary: 28000,
        totalWorkingDays: 30,
        presentDays: 30,
        unpaidLeaves: 0,
        rates: DEFAULT_STATUTORY_RATES,
      });

      expect(result).toBeNull();
    });
  });

  describe('EsicFileGeneratorService', () => {
    it('should generate official comma-separated ESIC contribution file', () => {
      const records = [
        {
          ipNumber: '1122334455',
          ipName: 'Pooja Verma',
          noOfDaysWagesPaid: 28,
          totalMonthlyWages: 18000,
          reasonForZeroWages: 0,
          eeContribution: 135,
          erContribution: 585,
          totalContribution: 720,
        },
      ];

      const esicFile = esicGenerator.generateEsicContributionFile(records);

      expect(esicFile.content).toContain('IP Number,IP Name,No of Days for which wages paid');
      expect(esicFile.content).toContain('1122334455,Pooja Verma,28,18000,0,');
      expect(esicFile.totalWages).toBe(18000);
      expect(esicFile.grandTotal).toBe(720);
    });
  });
});

