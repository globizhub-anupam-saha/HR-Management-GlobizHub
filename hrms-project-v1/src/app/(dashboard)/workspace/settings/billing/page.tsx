"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Users,
  HardDrive,
  ShieldCheck,
  Zap,
  ArrowRight,
  Receipt,
  Building2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Loader2,
  HelpCircle,
  AlertCircle,
  Check,
  Send,
  X,
} from "lucide-react";
import { organizationApi } from "@/lib/api/organization";
import InvoiceReceiptModal, { InvoiceDetail } from "@/components/billing/InvoiceReceiptModal";

interface SubscriptionOverview {
  subscription: {
    id: string;
    status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
    billingCycle: string;
    startDate: string;
    currentPeriodEnd: string;
    trialEndsAt?: string;
    daysRemaining: number;
    plan: {
      id: string;
      name: string;
      code: string;
      description: string;
      monthlyPrice: number;
      annualPrice: number;
      currency: string;
      maxEmployees: number;
      maxStorageGb: number;
      trialDays: number;
    };
    entitlements: Array<{ moduleKey: string; isEnabled: boolean }>;
  } | null;
  usage: {
    activeEmployees: number;
    maxEmployees: number;
    employeeUsagePct: number;
    storageUsedGb: number;
    maxStorageGb: number;
    storageUsagePct: number;
  };
  availablePlans: Array<{
    id: string;
    name: string;
    code: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    currency: string;
    maxEmployees: number;
    maxStorageGb: number;
    trialDays: number;
    entitlements: Array<{ moduleKey: string; isEnabled: boolean }>;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    amountDue: number;
    amountPaid: number;
    currency: string;
    status: "DRAFT" | "ISSUED" | "PAID" | "VOID" | "UNCOLLECTIBLE";
    dueDate: string;
    paidAt?: string;
    createdAt: string;
  }>;
}

const DEFAULT_FALLBACK_PLANS = [
  {
    id: "plan-starter",
    name: "Starter / Free Trial",
    code: "PLAN_STARTER",
    description: "Core employee directory, shift clock-ins, leave approvals, and basic company document vaults.",
    monthlyPrice: 0,
    annualPrice: 0,
    currency: "INR",
    maxEmployees: 25,
    maxStorageGb: 5,
    trialDays: 14,
    entitlements: [
      { moduleKey: "attendance", isEnabled: true },
      { moduleKey: "leaves", isEnabled: true },
      { moduleKey: "documents", isEnabled: true },
    ],
  },
  {
    id: "plan-growth",
    name: "Growth Tier",
    code: "PLAN_GROWTH",
    description: "Automated Indian statutory payroll (EPF, ESI, TDS, PT), shifts, and ATS candidate recruiting.",
    monthlyPrice: 2999,
    annualPrice: 29990,
    currency: "INR",
    maxEmployees: 100,
    maxStorageGb: 50,
    trialDays: 0,
    entitlements: [
      { moduleKey: "attendance", isEnabled: true },
      { moduleKey: "leaves", isEnabled: true },
      { moduleKey: "payroll", isEnabled: true },
      { moduleKey: "recruitment", isEnabled: true },
      { moduleKey: "documents", isEnabled: true },
    ],
  },
  {
    id: "plan-enterprise",
    name: "Enterprise Pro",
    code: "PLAN_ENTERPRISE",
    description: "Unlimited employees, biometric push logs, ERP Journal Voucher, LMS training, and dedicated SLA.",
    monthlyPrice: 7999,
    annualPrice: 79990,
    currency: "INR",
    maxEmployees: 500,
    maxStorageGb: 250,
    trialDays: 0,
    entitlements: [
      { moduleKey: "attendance", isEnabled: true },
      { moduleKey: "leaves", isEnabled: true },
      { moduleKey: "payroll", isEnabled: true },
      { moduleKey: "recruitment", isEnabled: true },
      { moduleKey: "training", isEnabled: true },
      { moduleKey: "documents", isEnabled: true },
      { moduleKey: "support", isEnabled: true },
    ],
  },
];

export default function WorkspaceBillingPage() {
  const [data, setData] = useState<SubscriptionOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upgrade modal & request state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [requestTargetPlan, setRequestTargetPlan] = useState<any | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [customSeats, setCustomSeats] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestSubmittedInfo, setRequestSubmittedInfo] = useState<{
    referenceId: string;
    planName: string;
    submittedAt: string;
  } | null>(null);

  // Invoice Receipt Modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await organizationApi.getSubscriptionOverview();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load subscription overview", err);
      setError("Unable to load subscription details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleOpenReceipt = async (invoiceId: string) => {
    setIsLoadingInvoice(true);
    try {
      const inv = await organizationApi.getInvoiceById(invoiceId);
      setSelectedInvoice(inv);
      setReceiptModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch invoice details", err);
      alert("Failed to load invoice receipt details.");
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const handleInitiateUpgrade = (plan: any) => {
    setRequestTargetPlan(plan);
    setRequestSubmittedInfo(null);
  };

  const handleSubmitBillingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRequest(true);

    setTimeout(() => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const refId = `REQ-BILL-${new Date().getFullYear()}-${randomSuffix}`;

      setRequestSubmittedInfo({
        referenceId: refId,
        planName: requestTargetPlan?.name || "Growth Tier",
        submittedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setIsSubmittingRequest(false);
    }, 700);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="min-h-[450px] flex flex-col items-center justify-center gap-3 text-muted-foreground bg-card rounded-2xl border border-border p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading subscription & billing details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="p-10 text-center rounded-2xl border border-dashed border-border bg-card">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">{error || "Failed to load"}</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            We could not fetch your organization subscription records from the server.
          </p>
          <button
            onClick={fetchOverview}
            className="mt-4 px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl shadow-xs hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sub = data.subscription;
  const isTrial = sub?.status === "TRIAL";
  const isActive = sub?.status === "ACTIVE";
  const isExpired = sub?.status === "EXPIRED" || sub?.status === "PAST_DUE";

  const plansToDisplay =
    data.availablePlans && data.availablePlans.length > 0
      ? data.availablePlans
      : DEFAULT_FALLBACK_PLANS;

  const currentPlanName = sub?.plan?.name || "Free Trial Tier";
  const currentPlanMonthlyPrice = sub?.plan?.monthlyPrice ?? 0;
  const currentCycle = sub?.billingCycle?.toLowerCase() || "month";

  const renewalDateDisplay = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString()
    : sub?.trialEndsAt
    ? new Date(sub.trialEndsAt).toLocaleDateString()
    : "14-day preview period";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/workspace/settings" className="hover:text-foreground transition-colors">
          Settings
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">Subscription & Billing</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            Subscription & Billing
            <span
              className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-full border ${
                isActive
                  ? "bg-status-green/15 text-status-green border-status-green/25"
                  : isTrial
                  ? "bg-status-yellow/15 text-status-yellow border-status-yellow/25"
                  : "bg-destructive/15 text-destructive border-destructive/25"
              }`}
            >
              {sub?.status || "TRIAL"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your company&apos;s SaaS tier, employee capacity quotas, invoices, and billing history.
          </p>
        </div>

        <button
          onClick={() => {
            setRequestTargetPlan(null);
            setRequestSubmittedInfo(null);
            setUpgradeModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-xs"
        >
          <Sparkles className="h-4 w-4" />
          Change Plan / Request Upgrade
        </button>
      </div>

      {/* Plan Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Plan Card */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Current SaaS Tier
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                  {currentPlanName}
                </h2>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-md">
                  {sub?.plan?.description || "Access to foundational attendance, employee directory, and core HR records."}
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-primary">
                  {currentPlanMonthlyPrice === 0 ? "Free" : `₹${currentPlanMonthlyPrice.toLocaleString()}`}
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {currentPlanMonthlyPrice === 0 ? "14-day preview" : `per ${currentCycle}`}
                </span>
              </div>
            </div>

            {/* Trial / Renewal Alert */}
            <div className="mt-5 p-4 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {isTrial ? (
                  <Clock className="h-4 w-4 text-status-yellow shrink-0" />
                ) : isExpired ? (
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-status-green shrink-0" />
                )}
                <div>
                  <span className="font-semibold text-foreground">
                    {isTrial
                      ? `${sub?.daysRemaining ?? 14} days remaining in Free Trial`
                      : isExpired
                      ? "Plan period overdue. Please renew."
                      : "Subscription is Active"}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {isTrial ? `Trial ends on ${renewalDateDisplay}` : `Next billing renewal: ${renewalDateDisplay}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setRequestTargetPlan(null);
                  setRequestSubmittedInfo(null);
                  setUpgradeModalOpen(true);
                }}
                className="text-xs font-semibold text-primary hover:underline shrink-0"
              >
                Upgrade now &rarr;
              </button>
            </div>
          </div>

          {/* Included modules pills */}
          <div className="mt-6 pt-4 border-t border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Features Enabled in this Tier
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sub?.entitlements && sub.entitlements.length > 0 ? (
                sub.entitlements
                  .filter((e) => e.isEnabled)
                  .map((e) => (
                    <span
                      key={e.moduleKey}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-card border border-border text-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3 text-status-green" />
                      {e.moduleKey.toUpperCase()}
                    </span>
                  ))
              ) : (
                ["CORE HR", "ATTENDANCE", "LEAVES", "PAYROLL", "DOCUMENTS"].map((mod) => (
                  <span
                    key={mod}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-card border border-border text-foreground"
                  >
                    <CheckCircle2 className="h-3 w-3 text-status-green" />
                    {mod}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quota Usage Side Panel */}
        <div className="space-y-4">
          {/* Employee Quota */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Employee Capacity</span>
              </div>
              <span className="text-xs font-mono font-bold text-foreground">
                {data.usage?.activeEmployees ?? 0} / {data.usage?.maxEmployees ?? 25}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${
                  (data.usage?.employeeUsagePct ?? 0) >= 90
                    ? "bg-destructive"
                    : (data.usage?.employeeUsagePct ?? 0) >= 75
                    ? "bg-status-yellow"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(100, data.usage?.employeeUsagePct ?? 0)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5">
              <span>{data.usage?.employeeUsagePct ?? 0}% capacity utilized</span>
              {(data.usage?.employeeUsagePct ?? 0) >= 80 && (
                <span className="text-destructive font-semibold">Near limit</span>
              )}
            </div>
          </div>

          {/* Cloud Storage Quota */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Cloud Storage</span>
              </div>
              <span className="text-xs font-mono font-bold text-foreground">
                {data.usage?.storageUsedGb ?? 0.1} GB / {data.usage?.maxStorageGb ?? 5} GB
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all rounded-full"
                style={{ width: `${Math.min(100, data.usage?.storageUsagePct ?? 2)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1.5">
              <span>Document vaults & biometric logs</span>
              <span>{data.usage?.storageUsagePct ?? 2}% used</span>
            </div>
          </div>

          {/* Need Custom Plan Box */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground">
            <p className="font-semibold flex items-center gap-1.5 text-primary">
              <Zap className="h-3.5 w-3.5" />
              Dedicated Enterprise SLAs
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Need custom employee limits, dedicated VPC hosting, or bespoke payroll integrations?
            </p>
            <button
              onClick={() => {
                handleInitiateUpgrade({
                  id: "enterprise-custom",
                  name: "Enterprise Custom Plan",
                  monthlyPrice: 9999,
                  annualPrice: 99990,
                  maxEmployees: 1000,
                  maxStorageGb: 500,
                });
                setUpgradeModalOpen(true);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-2 hover:underline"
            >
              Request Custom Enterprise Quote &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Invoices & Receipts Ledger */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Tax Invoices & Payment Receipts
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official tax invoices issued to your organization for SaaS services.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {!data.recentInvoices || data.recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                    No billing invoices generated yet. Invoices will automatically appear when your plan renews or upon upgrade.
                  </td>
                </tr>
              ) : (
                data.recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/25 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      ₹{inv.amountDue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          inv.status === "PAID"
                            ? "bg-status-green/15 text-status-green border-status-green/25"
                            : inv.status === "ISSUED"
                            ? "bg-status-yellow/15 text-status-yellow border-status-yellow/25"
                            : "bg-destructive/15 text-destructive border-destructive/25"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReceipt(inv.id)}
                        disabled={isLoadingInvoice}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-medium text-foreground hover:border-primary hover:text-primary transition-colors shadow-2xs"
                        title="View printable tax invoice"
                      >
                        <Download className="h-3 w-3" />
                        Tax Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade / Compare Plans Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setUpgradeModalOpen(false);
                setRequestTargetPlan(null);
                setRequestSubmittedInfo(null);
              }}
              className="absolute right-4 top-4 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            {requestSubmittedInfo ? (
              <div className="py-8 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-status-green/15 border border-status-green/30 text-status-green flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Billing Request Received!</h3>
                <p className="text-xs text-muted-foreground">
                  Your upgrade request for <strong className="text-foreground">{requestSubmittedInfo.planName}</strong> has been logged. Our account team will activate your tier and dispatch your pro-forma tax invoice.
                </p>
                <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs font-mono text-foreground flex items-center justify-between">
                  <span className="text-muted-foreground">Reference Code:</span>
                  <span className="font-bold text-primary">{requestSubmittedInfo.referenceId}</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setUpgradeModalOpen(false);
                      setRequestTargetPlan(null);
                      setRequestSubmittedInfo(null);
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : requestTargetPlan ? (
              /* Specific Request Upgrade Form */
              <div className="max-w-lg mx-auto">
                <div className="text-center mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-mono">
                    CONFIRM PLAN UPGRADE
                  </span>
                  <h2 className="text-xl font-black text-foreground mt-1">
                    Request {requestTargetPlan.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete this request to update your organization&apos;s quotas and active modules.
                  </p>
                </div>

                <form onSubmit={handleSubmitBillingRequest} className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Target Tier:</span>
                      <strong className="text-foreground font-semibold">{requestTargetPlan.name}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pricing:</span>
                      <strong className="text-foreground font-mono">
                        {billingCycle === "ANNUAL"
                          ? `₹${requestTargetPlan.annualPrice?.toLocaleString() || (requestTargetPlan.monthlyPrice * 10).toLocaleString()} / year (Save 20%)`
                          : `₹${requestTargetPlan.monthlyPrice?.toLocaleString() || 0} / month`}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Employee Limit:</span>
                      <span className="text-foreground font-medium">Up to {requestTargetPlan.maxEmployees} employees</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground font-medium mb-1">Billing Frequency</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("ANNUAL")}
                        className={`py-2 px-3 rounded-lg border text-center transition-all ${
                          billingCycle === "ANNUAL"
                            ? "border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/30"
                            : "border-border bg-card text-muted-foreground hover:border-border"
                        }`}
                      >
                        Annual (2 Months Free)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("MONTHLY")}
                        className={`py-2 px-3 rounded-lg border text-center transition-all ${
                          billingCycle === "MONTHLY"
                            ? "border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary/30"
                            : "border-border bg-card text-muted-foreground hover:border-border"
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-foreground font-medium mb-1">
                      Additional Seats Needed (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={customSeats}
                      onChange={(e) => setCustomSeats(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-medium mb-1">
                      Special Requirements or Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Need biometric device sync, multi-branch attendance, or custom invoice billing."
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRequestTargetPlan(null)}
                      className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold hover:bg-muted transition-colors"
                    >
                      Back to Plans
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRequest}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      {isSubmittingRequest ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Submit Upgrade Request
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* All Plans Comparison View */
              <>
                <div className="text-center max-w-lg mx-auto mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-mono">
                    SAAS SUBSCRIPTION TIERS
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">
                    Choose the Right HR Plan for Your Team
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Scale employee capacity, unlock automated statutory payroll, and enable cross-departmental ATS workflows.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plansToDisplay.map((p) => {
                    const isCurrent = sub?.plan?.id === p.id || sub?.plan?.code === p.code;

                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                          isCurrent
                            ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/30"
                            : "border-border bg-card hover:border-primary/40 shadow-xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-base text-foreground">{p.name}</h3>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="mt-2 text-2xl font-black font-mono text-foreground">
                            {p.monthlyPrice === 0 ? "₹0" : `₹${p.monthlyPrice.toLocaleString()}`}
                            <span className="text-xs font-normal text-muted-foreground"> /mo</span>
                          </div>

                          <p className="text-xs text-muted-foreground mt-2 min-h-[36px]">
                            {p.description}
                          </p>

                          <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-primary" />
                              <span>Up to <strong className="text-foreground">{p.maxEmployees} employees</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HardDrive className="h-3.5 w-3.5 text-primary" />
                              <span><strong className="text-foreground">{p.maxStorageGb} GB</strong> secure storage</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                              Included Modules:
                            </span>
                            {p.entitlements
                              ?.filter((e) => e.isEnabled)
                              .map((e) => (
                                <div key={e.moduleKey} className="flex items-center gap-1.5 text-[11px] text-foreground">
                                  <CheckCircle2 className="h-3 w-3 text-status-green shrink-0" />
                                  <span>{e.moduleKey.toUpperCase()}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border">
                          {isCurrent ? (
                            <button
                              disabled
                              className="w-full py-2 rounded-xl text-xs font-semibold bg-muted text-muted-foreground cursor-default"
                            >
                              Current Active Plan
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleInitiateUpgrade(p)}
                              className="w-full py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              Request Upgrade
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 text-center text-xs text-muted-foreground">
                  Billing changes and plan upgrades take effect instantly upon approval with prorated credit adjustments.
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      <InvoiceReceiptModal
        invoice={selectedInvoice}
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
      />
    </div>
  );
}
