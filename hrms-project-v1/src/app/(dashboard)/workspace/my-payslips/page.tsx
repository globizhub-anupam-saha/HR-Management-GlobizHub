"use client";

import api, { API_BASE_URL } from "@/lib/api";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Banknote,
  Calendar,
  Download,
  FileText,
  Loader2,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CardGridSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
import { payrollApi } from "@/lib/api/payroll";

export default function EmployeePayslipPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"payslips" | "tax" | "form16" | "loans">("payslips");
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [selectedFy, setSelectedFy] = useState("2026-2027");
  const [form16ModalOpen, setForm16ModalOpen] = useState(false);
  const [form16Data, setForm16Data] = useState<any>(null);
  const [isForm16Loading, setIsForm16Loading] = useState(false);

  // Tax declaration state
  const [taxForm, setTaxForm] = useState({
    financialYear: "2026-2027",
    regime: "NEW" as "OLD" | "NEW",
    section80C: 0,
    section80D: 0,
    section24b: 0,
    section80E: 0,
    section80G: 0,
    otherExemptions: 0,
    annualRentPaid: 0,
    landlordPan: "",
    landlordName: "",
    rentalAddress: "",
    isMetro: false,
  });

  const API_URL = API_BASE_URL;
  const getToken = () => localStorage.getItem("hrms_token");

  // 1. Fetch Employee's Own Payslips
  const { data: payslips, isLoading: isPayslipsLoading } = useQuery({
    queryKey: ["myPayslips"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/payroll/my-payslips`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return res.data;
    },
  });

  // 2. Fetch Employee's Tax Declaration
  const { data: taxDeclaration, isLoading: isTaxLoading } = useQuery({
    queryKey: ["myTaxDeclaration", selectedFy],
    queryFn: async () => {
      try {
        return await payrollApi.getMyTaxDeclaration(selectedFy);
      } catch {
        return null;
      }
    },
  });

  // Sync loaded tax declaration into form
  useState(() => {
    if (taxDeclaration) {
      setTaxForm({
        financialYear: taxDeclaration.financialYear || selectedFy,
        regime: taxDeclaration.regime || "NEW",
        section80C: taxDeclaration.section80C || 0,
        section80D: taxDeclaration.section80D || 0,
        section24b: taxDeclaration.section24b || 0,
        section80E: taxDeclaration.section80E || 0,
        section80G: taxDeclaration.section80G || 0,
        otherExemptions: taxDeclaration.otherExemptions || 0,
        annualRentPaid: taxDeclaration.annualRentPaid || 0,
        landlordPan: taxDeclaration.landlordPan || "",
        landlordName: taxDeclaration.landlordName || "",
        rentalAddress: taxDeclaration.rentalAddress || "",
        isMetro: taxDeclaration.isMetro || false,
      });
    }
  });

  // 3. Save / Submit Tax Declaration Mutation
  const taxMutation = useMutation({
    mutationFn: async (status: "DRAFT" | "SUBMITTED") => {
      return payrollApi.upsertTaxDeclaration({
        ...taxForm,
        financialYear: selectedFy,
        status,
      });
    },
    onSuccess: (_, status) => {
      alert(status === "SUBMITTED" ? "Tax declaration submitted for HR verification!" : "Draft saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["myTaxDeclaration", selectedFy] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to save tax declaration.");
    },
  });

  // 4. Fetch My Loans
  const { data: loans, isLoading: isLoansLoading } = useQuery({
    queryKey: ["myLoans"],
    queryFn: async () => {
      try {
        return await payrollApi.getMyLoans();
      } catch {
        return [];
      }
    },
  });

  // 5. Load Form 16
  const loadForm16 = async () => {
    setIsForm16Loading(true);
    try {
      const data = await payrollApi.getMyForm16(selectedFy);
      setForm16Data(data);
      setForm16ModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to load Form 16 certificate.");
    } finally {
      setIsForm16Loading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getMonthName = (monthNum: number) => {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="type-large-title font-bold text-foreground tracking-tight flex items-center">
            <Banknote className="size-8 mr-3 text-primary stroke-[1.5]" />
            Payroll & Tax Portal
          </h1>
          <p className="type-subhead text-label-secondary mt-1">
            Access your monthly payslips, Income Tax declarations, Form 16, and salary advances.
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="payslips" className="rounded-lg text-sm font-medium">
            <FileText className="w-4 h-4 mr-2" /> Payslips
          </TabsTrigger>
          <TabsTrigger value="tax" className="rounded-lg text-sm font-medium">
            <ShieldCheck className="w-4 h-4 mr-2" /> IT Declaration & Regime
          </TabsTrigger>
          <TabsTrigger value="form16" className="rounded-lg text-sm font-medium">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Form 16 Certificate
          </TabsTrigger>
          <TabsTrigger value="loans" className="rounded-lg text-sm font-medium">
            <CreditCard className="w-4 h-4 mr-2" /> Loans & Advances
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PAYSLIPS */}
        <TabsContent value="payslips" className="space-y-6 pt-4">
          {isPayslipsLoading ? (
            <CardGridSkeleton count={6} columns={3} showAvatar={false} />
          ) : payslips?.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Payslips Available"
              description="Your payslips will appear here once processed and approved by HR."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {payslips?.map((payslip: any) => (
                <Card
                  key={payslip.id}
                  className="hover:scale-[1.01] transition-transform cursor-pointer group bg-card"
                  onClick={() => setSelectedPayslip(payslip)}
                >
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 border-b border-hairline border-separator/50">
                    <div>
                      <CardTitle className="type-headline font-semibold text-foreground">
                        {getMonthName(payslip.month)} {payslip.year}
                      </CardTitle>
                      <p className="type-caption font-semibold text-label-secondary tracking-wider mt-1 uppercase">
                        Processed Salary
                      </p>
                    </div>
                    <div className="size-10 rounded-[12px] bg-primary/12 text-primary flex items-center justify-center transition-colors">
                      <FileText className="size-5 stroke-[1.5]" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-end mb-4">
                      <p className="type-subhead text-label-secondary font-medium">Net Take-Home</p>
                      <p className="type-title-1 font-bold text-foreground tabular-nums">
                        {formatCurrency(payslip.netSalary)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center type-caption text-label-secondary pt-3 border-t border-hairline border-separator/40">
                      <span className="flex items-center">
                        <Calendar className="size-3.5 mr-1 stroke-[1.5]" />
                        {payslip.totalWorkingDays} Scheduled Days
                      </span>
                      {payslip.unpaidLeaves > 0 && (
                        <span className="text-destructive font-medium tabular-nums">
                          {payslip.unpaidLeaves} LOP Days
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: IT DECLARATION & REGIME */}
        <TabsContent value="tax" className="space-y-6 pt-4">
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Income Tax (IT) Declarations & Regime Selection
                  </CardTitle>
                  <CardDescription>
                    Submit investment declarations to optimize TDS deductions for Financial Year {selectedFy}.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      taxDeclaration?.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : taxDeclaration?.status === "SUBMITTED"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }
                  >
                    Status: {taxDeclaration?.status || "NOT_SUBMITTED"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Regime Selector */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="text-sm font-bold text-slate-800 block">
                  Select Tax Regime for FY {selectedFy}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setTaxForm({ ...taxForm, regime: "NEW" })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      taxForm.regime === "NEW"
                        ? "border-indigo-600 bg-indigo-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">New Tax Regime (Default)</span>
                      {taxForm.regime === "NEW" && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Lower tax slab rates, ₹75,000 standard deduction. Zero tax up to ₹7,75,000 annual gross salary. No investment proofs required.
                    </p>
                  </div>

                  <div
                    onClick={() => setTaxForm({ ...taxForm, regime: "OLD" })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      taxForm.regime === "OLD"
                        ? "border-indigo-600 bg-indigo-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Old Tax Regime</span>
                      {taxForm.regime === "OLD" && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Allows Section 80C (₹1.5L), 80D, HRA rent exemption, and Section 24(b) housing loan interest. Requires proof submissions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Deductions Inputs (Shown for Old Regime) */}
              {taxForm.regime === "OLD" && (
                <div className="space-y-5 border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Chapter VI-A Deductions & HRA Exemptions
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Section 80C (PPF, ELSS, EPF, Life Insurance, Tuition Fees)
                      </label>
                      <Input
                        type="number"
                        placeholder="Max ₹1,50,000"
                        value={taxForm.section80C}
                        onChange={(e) => setTaxForm({ ...taxForm, section80C: Number(e.target.value) })}
                      />
                      <p className="text-[11px] text-slate-400">Statutory limit: ₹1,50,000/year</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Section 80D (Health Insurance for Self & Parents)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 25000"
                        value={taxForm.section80D}
                        onChange={(e) => setTaxForm({ ...taxForm, section80D: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Section 24(b) (Home Loan Interest - Self Occupied)
                      </label>
                      <Input
                        type="number"
                        placeholder="Max ₹2,00,000"
                        value={taxForm.section24b}
                        onChange={(e) => setTaxForm({ ...taxForm, section24b: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Section 80E / 80G / NPS 80CCD(1B)
                      </label>
                      <Input
                        type="number"
                        placeholder="Additional deductions"
                        value={taxForm.otherExemptions}
                        onChange={(e) => setTaxForm({ ...taxForm, otherExemptions: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* HRA Rent Details */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      House Rent Allowance (HRA) Exemption Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600">Annual Rent Paid (₹)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 180000"
                          value={taxForm.annualRentPaid}
                          onChange={(e) => setTaxForm({ ...taxForm, annualRentPaid: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Landlord PAN (if rent &gt; ₹1L)</label>
                        <Input
                          placeholder="ABCDE1234F"
                          value={taxForm.landlordPan}
                          onChange={(e) => setTaxForm({ ...taxForm, landlordPan: e.target.value.toUpperCase() })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Landlord Name</label>
                        <Input
                          placeholder="Landlord Name"
                          value={taxForm.landlordName}
                          onChange={(e) => setTaxForm({ ...taxForm, landlordName: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => taxMutation.mutate("DRAFT")}
                  disabled={taxMutation.isPending}
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() => taxMutation.mutate("SUBMITTED")}
                  disabled={taxMutation.isPending}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {taxMutation.isPending ? "Submitting..." : "Submit for Verification"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: FORM 16 CERTIFICATE */}
        <TabsContent value="form16" className="space-y-6 pt-4">
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Form 16 (TDS Certificate on Salary)
                  </CardTitle>
                  <CardDescription>
                    Official certificate under Section 203 of the Income Tax Act, 1961 for tax deducted at source.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={loadForm16}
                    disabled={isForm16Loading}
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {isForm16Loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                    View Form 16 (FY {selectedFy})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-indigo-400 stroke-1" />
                <h3 className="font-bold text-slate-800">Generate Form 16 for Assessment</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click the button above to view your quarterly tax summary (Part A) and detailed Chapter VI-A taxable income calculations (Part B).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: LOANS & ADVANCES */}
        <TabsContent value="loans" className="space-y-6 pt-4">
          <Card className="bg-white border-slate-200">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">
                My Salary Advances & Company Loans
              </CardTitle>
              <CardDescription>
                Track your active loan balances, tenure, and monthly payroll deductions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoansLoading ? (
                <div className="py-8 text-center text-slate-400">Loading loans...</div>
              ) : loans?.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No Active Loans"
                  description="You do not have any active salary advances or company loans."
                />
              ) : (
                <div className="space-y-6">
                  {loans?.map((loan: any) => (
                    <div key={loan.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                            {loan.type.replace(/_/g, " ")}
                          </span>
                          <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                            {formatCurrency(loan.principalAmount)}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Tenure: {loan.tenureMonths} Months | Monthly EMI: {formatCurrency(loan.monthlyEmi)}
                          </p>
                        </div>
                        <Badge
                          className={
                            loan.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : loan.status === "PAID_OFF"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {loan.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                        <div>
                          <p className="text-slate-400 font-medium">Principal</p>
                          <p className="font-bold text-slate-800">{formatCurrency(loan.principalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Total Repaid</p>
                          <p className="font-bold text-emerald-600">{formatCurrency(loan.totalPaid)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Remaining Balance</p>
                          <p className="font-bold text-rose-600">{formatCurrency(loan.remainingBalance)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Monthly Deduction</p>
                          <p className="font-bold text-slate-800">{formatCurrency(loan.monthlyEmi)}</p>
                        </div>
                      </div>

                      {loan.repayments?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-700">Recent Deductions</p>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Month / Year</TableHead>
                                <TableHead className="text-xs">Amount Paid</TableHead>
                                <TableHead className="text-xs">Date</TableHead>
                                <TableHead className="text-xs text-right">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {loan.repayments.slice(0, 5).map((rep: any) => (
                                <TableRow key={rep.id}>
                                  <TableCell className="text-xs font-medium">
                                    {getMonthName(rep.month)} {rep.year}
                                  </TableCell>
                                  <TableCell className="text-xs font-bold text-slate-800">
                                    {formatCurrency(rep.amount)}
                                  </TableCell>
                                  <TableCell className="text-xs text-slate-500">
                                    {new Date(rep.repaymentDate).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-xs text-right">
                                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                                      {rep.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL: FORM 16 VIEW & PRINT */}
      <Dialog open={form16ModalOpen} onOpenChange={setForm16ModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6">
          <DialogHeader className="print:hidden border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Form 16 Certificate - FY {selectedFy}
                </DialogTitle>
                <DialogDescription>
                  Certificate under Section 203 of the Income-Tax Act, 1961
                </DialogDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="print:hidden"
              >
                <Printer className="w-4 h-4 mr-2" /> Print Certificate
              </Button>
            </div>
          </DialogHeader>

          {form16Data && (
            <div className="space-y-6 pt-4 text-xs text-slate-800">
              {/* Employer / Employee Details */}
              <div className="grid grid-cols-2 gap-4 p-4 border border-slate-300 rounded-lg bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900 uppercase">Employer Details</p>
                  <p className="text-sm font-semibold">{form16Data.employer?.name}</p>
                  <p>TAN: <span className="font-mono font-bold">{form16Data.employer?.tan}</span></p>
                  <p>PAN: <span className="font-mono font-bold">{form16Data.employer?.pan}</span></p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 uppercase">Employee Details</p>
                  <p className="text-sm font-semibold">{form16Data.employee?.name}</p>
                  <p>PAN: <span className="font-mono font-bold">{form16Data.employee?.pan}</span></p>
                  <p>Employee Code: <span className="font-mono">{form16Data.employee?.employeeCode}</span></p>
                </div>
              </div>

              {/* Part A: Quarterly TDS Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-1">
                  PART A: Quarterly Summary of Tax Deducted & Deposited
                </h4>
                <Table className="border border-slate-200">
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Receipt / Challan No.</TableHead>
                      <TableHead className="text-right">Amount Paid (₹)</TableHead>
                      <TableHead className="text-right">Tax Deducted (₹)</TableHead>
                      <TableHead className="text-right">Tax Deposited (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form16Data.partA?.quarterlySummary?.map((q: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{q.quarter}</TableCell>
                        <TableCell className="font-mono text-[11px]">{q.receiptNumber}</TableCell>
                        <TableCell className="text-right">{formatCurrency(q.amountPaid)}</TableCell>
                        <TableCell className="text-right font-semibold text-rose-600">{formatCurrency(q.taxDeducted)}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(q.taxDeposited)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Part B: Tax Computation */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-slate-900 border-b pb-1">
                  PART B: Details of Salary Paid and Total Tax Computed
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                    <span>1. Gross Salary (under section 17)</span>
                    <span className="font-bold">{formatCurrency(form16Data.partB?.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>2. Less: Standard Deduction (u/s 16(ia))</span>
                    <span className="font-semibold text-emerald-600">- {formatCurrency(form16Data.partB?.standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>3. Less: Professional Tax (u/s 16(iii))</span>
                    <span className="font-semibold text-emerald-600">- {formatCurrency(form16Data.partB?.professionalTax)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>4. Chapter VI-A Total Deductions (80C, 80D, 24b)</span>
                    <span className="font-semibold text-emerald-600">- {formatCurrency(form16Data.partB?.chapterVIA?.totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b font-bold">
                    <span>5. Total Taxable Income</span>
                    <span>{formatCurrency(form16Data.partB?.totalTaxableIncome)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>6. Tax on Total Income</span>
                    <span>{formatCurrency(form16Data.partB?.taxOnTotalIncome)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>7. Less: Rebate u/s 87A</span>
                    <span className="font-semibold text-emerald-600">- {formatCurrency(form16Data.partB?.rebate87A)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>8. Health and Education Cess @ 4%</span>
                    <span>{formatCurrency(form16Data.partB?.healthAndEducationCess)}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-indigo-50 font-bold text-indigo-900">
                    <span>9. Total Tax Payable (Net)</span>
                    <span>{formatCurrency(form16Data.partB?.taxPayable)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: PAYSLIP PREVIEW (EXISTING) */}
      <Dialog
        open={selectedPayslip !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedPayslip(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader className="print:hidden">
            <DialogTitle>Monthly Payslip Breakdown</DialogTitle>
            <DialogDescription className="hidden">Official payslip breakdown</DialogDescription>
          </DialogHeader>

          {selectedPayslip && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-bold text-slate-900 uppercase">
                  {selectedPayslip.breakdown?.meta?.companyName || selectedPayslip.company?.name || "Company"}
                </h3>
                <p className="text-slate-500">
                  Payslip for {getMonthName(selectedPayslip.month)} {selectedPayslip.year}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 border-b pb-1 mb-2">Earnings</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Pay:</span>
                      <span className="font-semibold">{formatCurrency(selectedPayslip.basicPay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Allowances:</span>
                      <span className="font-semibold">{formatCurrency(selectedPayslip.allowances)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 border-b pb-1 mb-2">Deductions</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Deductions:</span>
                      <span className="font-semibold text-rose-600">{formatCurrency(selectedPayslip.deductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-lg flex justify-between items-center font-bold text-sm text-indigo-900">
                <span>Net Salary Payable:</span>
                <span>{formatCurrency(selectedPayslip.netSalary)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
