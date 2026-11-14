"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollApi } from "@/lib/api/payroll";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Calendar as CalendarIcon,
  Download,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Send,
  Loader2,
  ArrowLeft,
  Settings,
  Scale,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StatutoryCompliancePage() {
  const queryClient = useQueryClient();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedEstId, setSelectedEstId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "reconciliation" | "establishments" | "rules">("overview");

  // Modals state
  const [isEstModalOpen, setIsEstModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [selectedChallan, setSelectedChallan] = useState<any>(null);
  const [reconcileNotes, setReconcileNotes] = useState("");

  // Form states
  const [estForm, setEstForm] = useState({
    name: "",
    epfoEstablishmentCode: "",
    epfoExtension: "",
    esicEmployerCode: "",
  });

  const [submitForm, setSubmitForm] = useState({
    portalReference: "",
    documentPath: "",
  });

  const [challanForm, setChallanForm] = useState({
    challanNumber: "",
    trrn: "",
    amount: 0,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentReference: "",
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    method: "NET_BANKING",
    receiptPath: "",
  });

  // 1. Fetch Establishments
  const { data: establishments, isLoading: isEstLoading } = useQuery({
    queryKey: ["statutoryEstablishments"],
    queryFn: async () => {
      const data = await payrollApi.listEstablishments();
      if (data && data.length > 0 && !selectedEstId) {
        setSelectedEstId(data[0].id);
      }
      return data;
    },
  });

  // 2. Fetch Returns
  const { data: returns, isLoading: isReturnsLoading } = useQuery({
    queryKey: ["statutoryReturns", selectedEstId, selectedYear],
    queryFn: () =>
      payrollApi.listReturns({
        establishmentId: selectedEstId || undefined,
        year: parseInt(selectedYear),
      }),
    enabled: true,
  });

  // 3. Fetch Rules
  const { data: rules } = useQuery({
    queryKey: ["statutoryRules", selectedEstId],
    queryFn: () => (selectedEstId ? payrollApi.listRules(selectedEstId) : []),
    enabled: !!selectedEstId,
  });

  // 4. Fetch Reconciliations
  const { data: reconciliations, isLoading: isReconLoading } = useQuery({
    queryKey: ["statutoryReconciliations", selectedEstId],
    queryFn: async () => {
      const data = await payrollApi.listReconciliations({
        establishmentId: selectedEstId || undefined,
      });
      return data;
    },
  });

  // Mutations
  const reconcileMutation = useMutation({
    mutationFn: ({ returnId, notes }: { returnId: string; notes?: string }) =>
      payrollApi.reconcileReturn(returnId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statutoryReconciliations"] });
      queryClient.invalidateQueries({ queryKey: ["statutoryReturns"] });
      setIsReconcileModalOpen(false);
      setReconcileNotes("");
      alert("Reconciliation report computed successfully!");
    },
    onError: (err: any) => alert(err.response?.data?.message || "Reconciliation failed"),
  });
  const createEstMutation = useMutation({
    mutationFn: (data: typeof estForm) => payrollApi.createEstablishment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statutoryEstablishments"] });
      setIsEstModalOpen(false);
      setEstForm({ name: "", epfoEstablishmentCode: "", epfoExtension: "", esicEmployerCode: "" });
    },
    onError: (err: any) => alert(err.response?.data?.message || "Failed to create establishment"),
  });

  const calculateMutation = useMutation({
    mutationFn: () =>
      payrollApi.calculateStatutory({
        establishmentId: selectedEstId,
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
        type: "ALL",
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["statutoryReturns"] });
      alert(
        `Calculations complete!\nEPFO Members: ${data.epfo.memberCount} (Total: ₹${data.epfo.grandTotal})\nESIC Members: ${data.esic.memberCount} (Total: ₹${data.esic.grandTotal})`
      );
    },
    onError: (err: any) => alert(err.response?.data?.message || "Calculation failed"),
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => payrollApi.submitReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statutoryReturns"] });
      setIsSubmitModalOpen(false);
      setSubmitForm({ portalReference: "", documentPath: "" });
      alert("Portal submission recorded successfully!");
    },
    onError: (err: any) => alert(err.response?.data?.message || "Failed to record submission"),
  });

  const createChallanMutation = useMutation({
    mutationFn: (data: any) => payrollApi.createChallan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statutoryReturns"] });
      setIsChallanModalOpen(false);
      alert("Challan details saved!");
    },
    onError: (err: any) => alert(err.response?.data?.message || "Failed to create challan"),
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: any) => payrollApi.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statutoryReturns"] });
      setIsPaymentModalOpen(false);
      alert("Government payment reference recorded!");
    },
    onError: (err: any) => alert(err.response?.data?.message || "Failed to record payment"),
  });

  // File Download Handler
  const handleDownloadFile = async (type: "PF" | "ESI") => {
    if (!selectedEstId) {
      alert("Please select or create an establishment first.");
      return;
    }
    try {
      const response = await payrollApi.generateFile({
        establishmentId: selectedEstId,
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
        type,
      });

      const disposition = response.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `${type}_Return_${selectedMonth}_${selectedYear}.${type === "PF" ? "txt" : "csv"}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      queryClient.invalidateQueries({ queryKey: ["statutoryReturns"] });
    } catch (err: any) {
      let errorMessage = "Failed to generate return file.";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) errorMessage = parsed.message;
        } catch {
          // fallback to default
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      alert(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
          </Badge>
        );
      case "CHALLAN_GENERATED":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            <CreditCard className="w-3 h-3 mr-1" /> Challan Ready
          </Badge>
        );
      case "PORTAL_ACCEPTED":
      case "SUBMITTED":
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200">
            <Send className="w-3 h-3 mr-1" /> Submitted
          </Badge>
        );
      case "AWAITING_PORTAL_SUBMISSION":
      case "FILE_GENERATED":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> File Ready
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/workspace/payroll/admin"
              className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Payroll Admin
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Statutory Compliance (PF & ESI)
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Calculate statutory returns, generate official EPFO Revamped ECR and ESIC files, and track portal submissions.
              </p>
            </div>
          </div>
        </div>

        {/* PERIOD SELECTOR */}
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <CalendarIcon className="w-4 h-4 text-slate-400 ml-2" />
          <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val || "")}>
            <SelectTrigger className="w-[130px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December",
              ].map((m, idx) => (
                <SelectItem key={m} value={(idx + 1).toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px h-5 bg-slate-200" />
          <Select value={selectedYear} onValueChange={(val) => setSelectedYear(val || "")}>
            <SelectTrigger className="w-[90px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ESTABLISHMENT SELECTOR & TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Establishment:</span>
          <Select value={selectedEstId} onValueChange={(val) => setSelectedEstId(val || "")}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select Establishment" />
            </SelectTrigger>
            <SelectContent>
              {establishments?.map((est: any) => (
                <SelectItem key={est.id} value={est.id}>
                  {est.name} ({est.epfoEstablishmentCode || "No EPFO Code"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setIsEstModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Returns & Submissions
          </button>
          <button
            onClick={() => setActiveTab("establishments")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "establishments" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Establishments ({establishments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "rules" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rates & Rules
          </button>
          <button
            onClick={() => setActiveTab("reconciliation")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === "reconciliation" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Reconciliation & Audit
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & RETURNS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* ACTION TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Monthly Actions ({selectedMonth}/{selectedYear})
              </h3>
              <p className="text-xs text-slate-500">
                Run calculation snapshot, then download official files for portal upload.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => calculateMutation.mutate()}
                disabled={calculateMutation.isPending || !selectedEstId}
              >
                {calculateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                Calculate Snapshot
              </Button>

              <Button
                variant="default"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleDownloadFile("PF")}
                disabled={!selectedEstId}
              >
                <Download className="w-4 h-4 mr-2" />
                Download EPFO ECR (.txt)
              </Button>

              <Button
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleDownloadFile("ESI")}
                disabled={!selectedEstId}
              >
                <Download className="w-4 h-4 mr-2" />
                Download ESIC File (.csv)
              </Button>
            </div>
          </div>

          {/* RETURNS TABLE */}
          <Card className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <CardHeader className="bg-white border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center justify-between">
                <span>Filed & Pending Returns</span>
                <span className="text-xs font-normal text-slate-500">
                  {returns?.length || 0} Records Found
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Month / Year</TableHead>
                    <TableHead>Establishment</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Portal Ref / TRRN</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isReturnsLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                        <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                        Loading returns...
                      </TableCell>
                    </TableRow>
                  ) : returns?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No returns found for the selected year. Run "Calculate Snapshot" to begin.
                      </TableCell>
                    </TableRow>
                  ) : (
                    returns?.map((ret: any) => {
                      const latestSubmission = ret.submissions?.[ret.submissions.length - 1];
                      const latestChallan = ret.challans?.[ret.challans.length - 1];

                      return (
                        <TableRow key={ret.id}>
                          <TableCell className="font-semibold">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                ret.type === "PF"
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {ret.type === "PF" ? "EPFO ECR" : "ESIC Return"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(ret.month).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {ret.establishment?.name}
                          </TableCell>
                          <TableCell className="text-slate-500">v{ret.version}</TableCell>
                          <TableCell>{getStatusBadge(ret.status)}</TableCell>
                          <TableCell className="text-xs text-slate-600 font-mono">
                            {latestChallan?.trrn ? (
                              <span className="text-blue-600 font-semibold">TRRN: {latestChallan.trrn}</span>
                            ) : latestSubmission?.portalReference ? (
                              <span>Ack: {latestSubmission.portalReference}</span>
                            ) : (
                              <span className="text-slate-400">Not submitted</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {/* Record Submission */}
                            {ret.status === "AWAITING_PORTAL_SUBMISSION" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                                onClick={() => {
                                  setSelectedReturn(ret);
                                  setIsSubmitModalOpen(true);
                                }}
                              >
                                <Send className="w-3 h-3 mr-1" /> Record Submission
                              </Button>
                            )}

                            {/* Create Challan */}
                            {(ret.status === "PORTAL_ACCEPTED" || ret.status === "SUBMITTED") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                                onClick={() => {
                                  setSelectedReturn(ret);
                                  setIsChallanModalOpen(true);
                                }}
                              >
                                <CreditCard className="w-3 h-3 mr-1" /> Add Challan/TRRN
                              </Button>
                            )}

                            {/* Record Payment */}
                            {ret.status === "CHALLAN_GENERATED" && latestChallan && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => {
                                  setSelectedChallan(latestChallan);
                                  setPaymentForm((prev) => ({
                                    ...prev,
                                    amount: Number(latestChallan.amount),
                                  }));
                                  setIsPaymentModalOpen(true);
                                }}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Record Payment
                              </Button>
                            )}
                            {/* Reconcile Return */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                              onClick={() => {
                                setSelectedReturn(ret);
                                setIsReconcileModalOpen(true);
                              }}
                            >
                              <Scale className="w-3 h-3 mr-1" /> Reconcile
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: ESTABLISHMENTS */}
      {activeTab === "establishments" && (
        <Card className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <CardHeader className="bg-white border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Registered Establishments
              </CardTitle>
              <p className="text-xs text-slate-500">
                Manage multi-establishment registrations under your company.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsEstModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Establishment
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Establishment Name</TableHead>
                  <TableHead>EPFO Establishment Code</TableHead>
                  <TableHead>EPFO Extension</TableHead>
                  <TableHead>ESIC Employer Code</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Returns Filed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {establishments?.map((est: any) => (
                  <TableRow key={est.id}>
                    <TableCell className="font-semibold text-slate-800">{est.name}</TableCell>
                    <TableCell className="font-mono text-sm">{est.epfoEstablishmentCode || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{est.epfoExtension || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{est.esicEmployerCode || "-"}</TableCell>
                    <TableCell>{est._count?.employeeProfiles || 0}</TableCell>
                    <TableCell>{est._count?.returns || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: STATUTORY RATES & RULES */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <Card className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <CardHeader className="bg-white border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-base font-semibold text-slate-800">
                Applicable Statutory Rates (Indian Labour Standards)
              </CardTitle>
              <p className="text-xs text-slate-500">
                Rates stored with effective dates. Can be overridden per establishment when official government notifications change.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="text-xs font-semibold text-indigo-700 uppercase">EPF (Employee Share)</span>
                  <div className="text-2xl font-bold text-indigo-950 mt-1">12.00%</div>
                  <p className="text-xs text-slate-500 mt-1">Capped at ₹15,000 monthly wage ceiling (₹1,800 max)</p>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="text-xs font-semibold text-indigo-700 uppercase">EPS (Pension - Employer)</span>
                  <div className="text-2xl font-bold text-indigo-950 mt-1">8.33%</div>
                  <p className="text-xs text-slate-500 mt-1">Capped at ₹1,250 max (Zero for age &gt;= 58)</p>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="text-xs font-semibold text-indigo-700 uppercase">EDLI (Insurance - Employer)</span>
                  <div className="text-2xl font-bold text-indigo-950 mt-1">0.50%</div>
                  <p className="text-xs text-slate-500 mt-1">Capped at ₹75 max (0.5% of ₹15,000)</p>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="text-xs font-semibold text-indigo-700 uppercase">EPF Admin Charges</span>
                  <div className="text-2xl font-bold text-indigo-950 mt-1">0.50%</div>
                  <p className="text-xs text-slate-500 mt-1">Minimum ₹500 per month per establishment</p>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-700 uppercase">ESIC (Employee Share)</span>
                  <div className="text-2xl font-bold text-emerald-950 mt-1">0.75%</div>
                  <p className="text-xs text-slate-500 mt-1">Ceiling ₹21,000/mo (Exempt if daily wage &lt;= ₹176)</p>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-700 uppercase">ESIC (Employer Share)</span>
                  <div className="text-2xl font-bold text-emerald-950 mt-1">3.25%</div>
                  <p className="text-xs text-slate-500 mt-1">Applied on Gross wages of eligible employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: RECONCILIATION */}
      {activeTab === "reconciliation" && (
        <div className="space-y-6">
          <Card className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <CardHeader className="bg-white border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">
                  Statutory Reconciliation & Discrepancy Audits
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Cross-verify payroll computed amounts, generated returns, challans, and portal payments.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return</TableHead>
                    <TableHead>Establishment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contributions</TableHead>
                    <TableHead>Challan Total</TableHead>
                    <TableHead>Paid Total</TableHead>
                    <TableHead>Audited At</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isReconLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                        <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                        Loading reconciliation audits...
                      </TableCell>
                    </TableRow>
                  ) : reconciliations?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                        No reconciliation audits recorded yet. Click "Reconcile" on any return in the Returns tab to run an audit.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reconciliations?.map((rec: any) => {
                      const diff = rec.discrepancies;
                      return (
                        <TableRow key={rec.id}>
                          <TableCell className="font-semibold text-xs">
                            <span
                              className={`px-2 py-0.5 rounded ${
                                rec.return?.type === "PF"
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {rec.return?.type === "PF" ? "EPFO ECR" : "ESIC"}
                            </span>{" "}
                            {rec.return?.month &&
                              new Date(rec.return.month).toLocaleDateString("en-IN", {
                                month: "short",
                                year: "numeric",
                              })}
                          </TableCell>
                          <TableCell className="text-slate-600 text-xs">
                            {rec.return?.establishment?.name}
                          </TableCell>
                          <TableCell>
                            {rec.status === "MATCHED" ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> MATCHED
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-50 text-rose-700 border-rose-200">
                                <AlertCircle className="w-3 h-3 mr-1" /> MISMATCH
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-medium">
                            ₹{diff?.totalContributions ?? "0.00"}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-medium">
                            ₹{diff?.totalChallanAmount ?? "0.00"}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-medium">
                            ₹{diff?.totalPaidAmount ?? "0.00"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(rec.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 max-w-xs truncate" title={rec.notes}>
                            {rec.notes || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                              disabled={reconcileMutation.isPending}
                              onClick={() => {
                                reconcileMutation.mutate({
                                  returnId: rec.returnId || rec.return?.id,
                                  notes: "Re-audited and verified with contributions",
                                });
                              }}
                            >
                              <RefreshCw
                                className={`w-3 h-3 mr-1 ${
                                  reconcileMutation.isPending ? "animate-spin" : ""
                                }`}
                              />
                              Re-audit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL 1: ADD ESTABLISHMENT */}
      <Dialog open={isEstModalOpen} onOpenChange={setIsEstModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Register New Establishment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-slate-700">Establishment Name *</label>
              <Input
                placeholder="e.g. Headquarters / Mumbai Branch"
                value={estForm.name}
                onChange={(e) => setEstForm({ ...estForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">EPFO Establishment Code</label>
              <Input
                placeholder="e.g. DLCPM0012345000"
                value={estForm.epfoEstablishmentCode}
                onChange={(e) => setEstForm({ ...estForm, epfoEstablishmentCode: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">EPFO Extension</label>
              <Input
                placeholder="e.g. 000"
                value={estForm.epfoExtension}
                onChange={(e) => setEstForm({ ...estForm, epfoExtension: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">ESIC Employer Code</label>
              <Input
                placeholder="e.g. 11000123450001001"
                value={estForm.esicEmployerCode}
                onChange={(e) => setEstForm({ ...estForm, esicEmployerCode: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEstModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createEstMutation.mutate(estForm)}
              disabled={createEstMutation.isPending || !estForm.name}
            >
              {createEstMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Establishment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: RECORD PORTAL SUBMISSION */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Record Government Portal Upload</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500">
              Enter the official reference received after uploading the return to the EPFO/ESIC portal.
            </p>
            <div>
              <label className="text-xs font-medium text-slate-700">Portal Acknowledgment Ref *</label>
              <Input
                placeholder="e.g. ECR Ack No. 12345678"
                value={submitForm.portalReference}
                onChange={(e) => setSubmitForm({ ...submitForm, portalReference: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Acknowledgment PDF URL / Path *</label>
              <Input
                placeholder="e.g. https://... or storage/receipt.pdf"
                value={submitForm.documentPath}
                onChange={(e) => setSubmitForm({ ...submitForm, documentPath: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                submitMutation.mutate({
                  returnId: selectedReturn?.id,
                  portalReference: submitForm.portalReference,
                  documentPath: submitForm.documentPath,
                })
              }
              disabled={submitMutation.isPending || !submitForm.portalReference}
            >
              Confirm Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: ADD CHALLAN / TRRN */}
      <Dialog open={isChallanModalOpen} onOpenChange={setIsChallanModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Record Portal Challan & TRRN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-slate-700">Challan Number *</label>
              <Input
                placeholder="e.g. CHN-2026-001"
                value={challanForm.challanNumber}
                onChange={(e) => setChallanForm({ ...challanForm, challanNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">TRRN (Temporary Return Ref No.) *</label>
              <Input
                placeholder="e.g. 1012604001234"
                value={challanForm.trrn}
                onChange={(e) => setChallanForm({ ...challanForm, trrn: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Challan Amount (₹) *</label>
              <Input
                type="number"
                placeholder="0"
                value={challanForm.amount || ""}
                onChange={(e) => setChallanForm({ ...challanForm, amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Due Date *</label>
              <Input
                type="date"
                value={challanForm.dueDate}
                onChange={(e) => setChallanForm({ ...challanForm, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChallanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createChallanMutation.mutate({
                  returnId: selectedReturn?.id,
                  ...challanForm,
                })
              }
              disabled={createChallanMutation.isPending || !challanForm.trrn}
            >
              Save Challan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: RECORD PAYMENT */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Record Official Payment Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-slate-700">Bank / EPFO Payment Reference *</label>
              <Input
                placeholder="e.g. UTR / Transaction No. 2026041512345"
                value={paymentForm.paymentReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Paid Amount (₹) *</label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Payment Date *</label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Payment Method</label>
              <Select
                value={paymentForm.method}
                onValueChange={(val) => setPaymentForm({ ...paymentForm, method: val || "NET_BANKING" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NET_BANKING">Net Banking (Authorized Portal Bank)</SelectItem>
                  <SelectItem value="NEFT_RTGS">NEFT / RTGS</SelectItem>
                  <SelectItem value="PORTAL_GATEWAY">Portal Direct Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Official Receipt PDF URL / Path *</label>
              <Input
                placeholder="e.g. storage/receipts/epfo_challan_10126.pdf"
                value={paymentForm.receiptPath}
                onChange={(e) => setPaymentForm({ ...paymentForm, receiptPath: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                recordPaymentMutation.mutate({
                  challanId: selectedChallan?.id,
                  ...paymentForm,
                })
              }
              disabled={recordPaymentMutation.isPending || !paymentForm.paymentReference}
            >
              Verify & Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: RECONCILE RETURN */}
      <Dialog open={isReconcileModalOpen} onOpenChange={setIsReconcileModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Audit & Reconcile Statutory Return</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500">
              Run automated reconciliation cross-checking payroll snapshot contributions against portal challans and payments for{" "}
              <span className="font-semibold text-slate-800">
                {selectedReturn?.type === "PF" ? "EPFO ECR" : "ESIC Return"} (v{selectedReturn?.version})
              </span>.
            </p>
            <div>
              <label className="text-xs font-medium text-slate-700">Audit Notes (Optional)</label>
              <Input
                placeholder="e.g. Verified by Compliance Officer"
                value={reconcileNotes}
                onChange={(e) => setReconcileNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReconcileModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() =>
                reconcileMutation.mutate({
                  returnId: selectedReturn?.id,
                  notes: reconcileNotes,
                })
              }
              disabled={reconcileMutation.isPending}
            >
              {reconcileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Run Audit & Reconciliation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

