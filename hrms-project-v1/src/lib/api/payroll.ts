import api from "../api";

export const payrollApi = {
  getMyPayslips: async (params?: any) => {
    const res = await api.get("/payroll/my-payslips", { params });
    return res.data;
  },

  getSettings: async () => {
    try {
      const res = await api.get("/settings");
      return res.data;
    } catch {
      const res = await api.get("/payroll/settings");
      return res.data;
    }
  },

  updateSettings: async (data: any) => {
    try {
      const res = await api.patch("/settings", data);
      return res.data;
    } catch {
      const res = await api.put("/settings", data);
      return res.data;
    }
  },

  getSalaryStructure: async (employeeId: string) => {
    const res = await api.get(`/payroll/salary-structure/${employeeId}`);
    return res.data;
  },

  saveSalaryStructure: async (employeeId: string, data: any) => {
    const res = await api.post(`/payroll/salary-structure/${employeeId}`, data);
    return res.data;
  },

  getSalaryTemplates: async () => {
    const res = await api.get("/payroll/templates");
    return res.data;
  },

  createSalaryTemplate: async (data: any) => {
    const res = await api.post("/payroll/templates", data);
    return res.data;
  },

  updateSalaryTemplate: async (id: string, data: any) => {
    const res = await api.patch(`/payroll/templates/${id}`, data);
    return res.data;
  },

  deleteSalaryTemplate: async (id: string) => {
    const res = await api.delete(`/payroll/templates/${id}`);
    return res.data;
  },

  // Statutory Compliance APIs
  listEstablishments: async () => {
    const res = await api.get("/payroll/statutory/establishments");
    return res.data;
  },

  createEstablishment: async (data: any) => {
    const res = await api.post("/payroll/statutory/establishments", data);
    return res.data;
  },

  updateEstablishment: async (id: string, data: any) => {
    const res = await api.patch(`/payroll/statutory/establishments/${id}`, data);
    return res.data;
  },

  listRules: async (establishmentId: string) => {
    const res = await api.get(`/payroll/statutory/rules/${establishmentId}`);
    return res.data;
  },

  upsertRule: async (data: any) => {
    const res = await api.post("/payroll/statutory/rules", data);
    return res.data;
  },

  listEmployeeProfiles: async (establishmentId: string) => {
    const res = await api.get(`/payroll/statutory/employee-profiles/${establishmentId}`);
    return res.data;
  },

  upsertEmployeeProfile: async (data: any) => {
    const res = await api.post("/payroll/statutory/employee-profile", data);
    return res.data;
  },

  calculateStatutory: async (data: { establishmentId: string; month: number; year: number; type: string }) => {
    const res = await api.post("/payroll/statutory/calculate", data);
    return res.data;
  },

  generateFile: async (data: { establishmentId: string; month: number; year: number; type: "PF" | "ESI" }) => {
    const res = await api.post("/payroll/statutory/generate-file", data, {
      responseType: "blob",
    });
    return res;
  },

  submitReturn: async (data: { returnId: string; portalReference: string; documentPath: string }) => {
    const res = await api.post("/payroll/statutory/submit", data);
    return res.data;
  },

  createChallan: async (data: { returnId: string; challanNumber: string; trrn: string; amount: number; dueDate: string }) => {
    const res = await api.post("/payroll/statutory/challans", data);
    return res.data;
  },

  recordPayment: async (data: { challanId: string; paymentReference: string; amount: number; paymentDate: string; method: string; receiptPath: string }) => {
    const res = await api.post("/payroll/statutory/record-payment", data);
    return res.data;
  },

  listReturns: async (params?: { establishmentId?: string; year?: number }) => {
    const res = await api.get("/payroll/statutory/returns", { params });
    return res.data;
  },

  reconcileReturn: async (returnId: string, notes?: string) => {
    const res = await api.post(`/payroll/statutory/reconcile/${returnId}`, { notes });
    return res.data;
  },

  listReconciliations: async (params?: { returnId?: string; establishmentId?: string }) => {
    const res = await api.get("/payroll/statutory/reconciliations", { params });
    return res.data;
  },

  // Salary Hold & Release
  holdPayroll: async (id: string, reason: string) => {
    const res = await api.patch(`/payroll/${id}/hold`, { reason });
    return res.data;
  },

  releasePayroll: async (id: string) => {
    const res = await api.patch(`/payroll/${id}/release`);
    return res.data;
  },

  // Full & Final Settlement (F&F)
  calculateSettlement: async (data: {
    employeeId: string;
    exitDate: string;
    noticeShortfallDays?: number;
    additionalBonus?: number;
    additionalDeductions?: number;
    remarks?: string;
  }) => {
    const res = await api.post("/payroll/settlement/calculate", data);
    return res.data;
  },

  processSettlement: async (data: {
    employeeId: string;
    exitDate: string;
    noticeShortfallDays?: number;
    additionalBonus?: number;
    additionalDeductions?: number;
    remarks?: string;
  }) => {
    const res = await api.post("/payroll/settlement/process", data);
    return res.data;
  },

  // Income Tax & IT Declarations
  upsertTaxDeclaration: async (data: any) => {
    const res = await api.post("/payroll/tax-declarations", data);
    return res.data;
  },

  getMyTaxDeclaration: async (financialYear?: string) => {
    const res = await api.get("/payroll/tax-declarations/my", {
      params: { financialYear },
    });
    return res.data;
  },

  listCompanyTaxDeclarations: async (financialYear?: string) => {
    const res = await api.get("/payroll/tax-declarations/company", {
      params: { financialYear },
    });
    return res.data;
  },

  verifyTaxDeclaration: async (id: string, data: { status: "APPROVED" | "REJECTED"; rejectionReason?: string }) => {
    const res = await api.patch(`/payroll/tax-declarations/${id}/verify`, data);
    return res.data;
  },

  // Form 16 & Form 24Q
  getMyForm16: async (financialYear?: string) => {
    const res = await api.get("/payroll/form16/my", {
      params: { financialYear },
    });
    return res.data;
  },

  getEmployeeForm16: async (employeeId: string, financialYear?: string) => {
    const res = await api.get(`/payroll/form16/${employeeId}`, {
      params: { financialYear },
    });
    return res.data;
  },

  downloadForm24Q: async (quarter: "Q1" | "Q2" | "Q3" | "Q4", financialYear: string) => {
    const res = await api.get("/payroll/form24q", {
      params: { quarter, financialYear },
      responseType: "blob",
    });
    return res;
  },

  // Loans & Salary Advances
  createLoan: async (data: any) => {
    const res = await api.post("/payroll/loans", data);
    return res.data;
  },

  getMyLoans: async () => {
    const res = await api.get("/payroll/loans/my");
    return res.data;
  },

  listCompanyLoans: async (params?: { status?: string; employeeId?: string }) => {
    const res = await api.get("/payroll/loans/company", { params });
    return res.data;
  },

  updateLoanStatus: async (id: string, data: { status: string; rejectionReason?: string }) => {
    const res = await api.patch(`/payroll/loans/${id}/status`, data);
    return res.data;
  },

  // Accounting Journal Voucher (JV)
  getJournalVoucher: async (month: number, year: number, format?: "json" | "csv") => {
    if (format === "csv") {
      const res = await api.get("/payroll/journal-voucher", {
        params: { month, year, format: "csv" },
        responseType: "blob",
      });
      return res;
    }
    const res = await api.get("/payroll/journal-voucher", {
      params: { month, year },
    });
    return res.data;
  },
};

