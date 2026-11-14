import { generateDepartmentScopedEmployeeCode } from './employee-code.util';

describe('Department-Scoped Employee Code Generator', () => {
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      company: {
        findUnique: jest.fn().mockResolvedValue({
          name: 'Tech Corp',
          settings: {
            employeeIdPrefix: 'EMP',
            employeeIdFormat: '{PREFIX}-{DEPT}-{NUMBER}',
            employeeIdDigits: 3,
          },
        }),
      },
      department: {
        findUnique: jest.fn().mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === 'dept-eng') return Promise.resolve({ name: 'Engineering' });
          if (where.id === 'dept-hr') return Promise.resolve({ name: 'Human Resources' });
          if (where.id === 'dept-med') return Promise.resolve({ name: 'Medical' });
          return Promise.resolve(null);
        }),
      },
      employee: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };
  });

  it('should start at 001 for Department A', async () => {
    prismaMock.employee.findMany.mockResolvedValue([]); // No existing employees in ENG
    prismaMock.employee.findFirst.mockResolvedValue(null); // No collision

    const code = await generateDepartmentScopedEmployeeCode({
      prisma: prismaMock,
      companyId: 'comp-1',
      departmentId: 'dept-eng',
    });

    expect(code).toBe('EMP-ENG-001');
  });

  it('should start at 001 for Department B even if Department A has employee 001', async () => {
    // When querying Department B (HR), dept-scoped findMany only returns employees in HR (which is empty)
    prismaMock.employee.findMany.mockImplementation(({ where }: any) => {
      if (where.departmentId === 'dept-hr') {
        return Promise.resolve([]); // HR has 0 employees
      }
      return Promise.resolve([{ employeeCode: 'EMP-ENG-001' }]);
    });
    prismaMock.employee.findFirst.mockResolvedValue(null); // 'EMP-HR-001' is not taken

    const hrCode = await generateDepartmentScopedEmployeeCode({
      prisma: prismaMock,
      companyId: 'comp-1',
      departmentId: 'dept-hr',
    });

    // CRITICAL REQUIREMENT: Department B must get 001, NOT 002!
    expect(hrCode).toBe('EMP-HR-001');
  });

  it('should increment within Department B when Department B already has 001', async () => {
    prismaMock.employee.findMany.mockResolvedValue([
      { employeeCode: 'EMP-HR-001' },
    ]);
    prismaMock.employee.findFirst.mockResolvedValue(null);

    const hrCode2 = await generateDepartmentScopedEmployeeCode({
      prisma: prismaMock,
      companyId: 'comp-1',
      departmentId: 'dept-hr',
    });

    expect(hrCode2).toBe('EMP-HR-002');
  });

  it('should generate new department ID when changing department from ENG to HR', async () => {
    // HR already has EMP-HR-001 and EMP-HR-002
    prismaMock.employee.findMany.mockResolvedValue([
      { employeeCode: 'EMP-HR-001' },
      { employeeCode: 'EMP-HR-002' },
    ]);
    prismaMock.employee.findFirst.mockResolvedValue(null);

    const transferredCode = await generateDepartmentScopedEmployeeCode({
      prisma: prismaMock,
      companyId: 'comp-1',
      departmentId: 'dept-hr',
      excludeEmployeeId: 'emp-moving-from-eng',
    });

    expect(transferredCode).toBe('EMP-HR-003');
  });
});

