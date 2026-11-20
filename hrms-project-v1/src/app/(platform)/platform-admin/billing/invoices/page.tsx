"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  ShieldCheck,
  X,
  CreditCard,
  DollarSign,
  Download,
  AlertOctagon,
} from "lucide-react";
import { platformApi } from "@/lib/platform-api";
import InvoiceReceiptModal from "@/components/billing/InvoiceReceiptModal";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  companyId: string;
  companyName: string;
  companyEmail: string;
  planName: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: "DRAFT" | "ISSUED" | "PAID" | "VOID" | "UNCOLLECTIBLE";
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
  createdAt: string;
  paymentCount: number;
}

interface InvoicesResponse {
  data: InvoiceItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
  };
}

interface CompanyOption {
  id: string;
  name: string;
  email: string;
}

function getDefaultInvoiceDueDate(): string {
  return new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [summary, setSummary] = useState({ totalInvoiced: 0, totalCollected: 0, totalOutstanding: 0 });
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 20 });

  // Create Invoice Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState("");
  const [createError, setCreateError] = useState("");

  // Invoice Receipt / Print Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const handleViewInvoice = async (id: string) => {
    try {
      const res = await platformApi.get(`/platform/billing/invoices/${id}`);
      setSelectedInvoice(res.data);
      setReceiptModalOpen(true);
    } catch (err) {
      console.error("Failed to load invoice details", err);
    }
  };
  const [form, setForm] = useState(() => ({
    companyId: "",
    amountDue: 4999,
    currency: "INR",
    dueDate: getDefaultInvoiceDueDate(),
    notes: "",
  }));

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", "20");

      const res = await platformApi.get<InvoicesResponse>(
        `/platform/billing/invoices?${params.toString()}`
      );
      setInvoices(res.data?.data || []);
      setMeta(res.data?.meta || { total: 0, totalPages: 1, limit: 20 });
      if (res.data?.summary) setSummary(res.data.summary);
    } catch (err: any) {
      console.error("Failed to load invoices", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  const loadCompanies = async () => {
    try {
      const res = await platformApi.get<{ data: any[] }>("/platform/organizations?limit=100");
      const list = (res.data?.data || []).map((c) => ({ id: c.id, name: c.name, email: c.email }));
      setCompanies(list);
      if (list[0]) setForm((prev) => ({ ...prev, companyId: list[0].id }));
    } catch (e) {
      console.error("Failed to load companies for billing", e);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleUpdateStatus = async (invoiceId: string, newStatus: string) => {
    try {
      await platformApi.put(`/platform/billing/invoices/${invoiceId}/status`, {
        status: newStatus,
      });
      fetchInvoices();
    } catch (err: any) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateSuccess("");
    setCreateError("");

    try {
      await platformApi.post("/platform/billing/invoices", {
        companyId: form.companyId,
        amountDue: Number(form.amountDue),
        currency: form.currency,
        dueDate: new Date(form.dueDate).toISOString(),
        notes: form.notes || undefined,
      });

      setCreateSuccess("Invoice generated successfully!");
      setTimeout(() => {
        setCreateModalOpen(false);
        fetchInvoices();
      }, 1000);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">SaaS Invoices</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
              {meta.total} Invoice{meta.total !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Global invoice ledger across all SaaS tenants with tax records, status reconciliation, and PDF exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchInvoices()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-foreground bg-card border border-border hover:bg-muted rounded-lg transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button
            onClick={() => {
              setCreateSuccess("");
              setCreateError("");
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors shadow-md shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Generate Invoice
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
            Total Invoiced
          </span>
          <div className="text-2xl font-bold font-mono text-foreground">
            ₹{summary.totalInvoiced.toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">All issued SaaS invoices</span>
        </div>

        <div className="rounded-xl border border-status-green/25 bg-emerald-500/5 p-4 shadow-lg">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-status-green block mb-1">
            Total Collected
          </span>
          <div className="text-2xl font-bold font-mono text-status-green">
            ₹{summary.totalCollected.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">Successfully reconciled</span>
        </div>

        <div className="rounded-xl border border-status-orange/25 bg-amber-500/5 p-4 shadow-lg">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-status-orange block mb-1">
            Outstanding / Overdue
          </span>
          <div className="text-2xl font-bold font-mono text-status-orange">
            ₹{summary.totalOutstanding.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-500/80 mt-1 block">Pending payment</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by invoice number or company name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ISSUED">Issued (Pending)</option>
            <option value="PAID">Paid</option>
            <option value="DRAFT">Draft</option>
            <option value="VOID">Void</option>
            <option value="UNCOLLECTIBLE">Uncollectible</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Organization</th>
                <th className="py-3.5 px-4">Plan</th>
                <th className="py-3.5 px-4">Amount Due / Paid</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isPaid = inv.status === "PAID";
                  const isIssued = inv.status === "ISSUED";
                  const isVoid = inv.status === "VOID";

                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/platform-admin/organizations/${inv.companyId}`}
                          className="font-medium text-foreground hover:text-primary transition-colors block"
                        >
                          {inv.companyName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground truncate block max-w-[200px]">
                          {inv.companyEmail}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-foreground">{inv.planName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold font-mono text-foreground">
                          ₹{inv.amountDue.toLocaleString()}
                        </div>
                        {isPaid && (
                          <div className="text-[10px] text-status-green font-mono">
                            Paid: ₹{inv.amountPaid.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isPaid
                              ? "bg-status-green/15 text-status-green border-status-green/25"
                              : isIssued
                              ? "bg-status-orange/15 text-status-orange border-status-orange/25"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {isPaid && <CheckCircle2 className="h-3 w-3" />}
                          {isIssued && <Clock className="h-3 w-3" />}
                          {isVoid && <AlertOctagon className="h-3 w-3" />}
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-foreground">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isIssued && (
                            <button
                              onClick={() => handleUpdateStatus(inv.id, "PAID")}
                              className="px-2.5 py-1 rounded bg-status-green/15 text-status-green border border-status-green/25 hover:bg-status-green/25 transition-colors text-[11px] font-medium"
                            >
                              Mark Paid
                            </button>
                          )}
                          {isIssued && (
                            <button
                              onClick={() => handleUpdateStatus(inv.id, "VOID")}
                              className="px-2.5 py-1 rounded bg-destructive/15 text-destructive border border-destructive/25 hover:bg-destructive/25 transition-colors text-[11px] font-medium"
                            >
                              Void
                            </button>
                          )}
                          <button
                            onClick={() => handleViewInvoice(inv.id)}
                            className="p-1.5 rounded bg-card border border-border text-muted-foreground hover:text-foreground transition-colors hover:border-primary/40"
                            title="View / Print Tax Invoice"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Showing {(page - 1) * meta.limit + (invoices.length > 0 ? 1 : 0)} to{" "}
            {Math.min(page * meta.limit, meta.total)} of {meta.total} invoices
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground disabled:opacity-40 hover:bg-muted"
            >
              Previous
            </button>
            <span className="font-mono text-muted-foreground">
              Page {page} of {meta.totalPages || 1}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground disabled:opacity-40 hover:bg-muted"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Generate Manual Invoice */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-muted/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/15 border border-primary/25 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Generate SaaS Invoice</h3>
                <p className="text-xs text-muted-foreground">
                  Issue a formal tax invoice to a customer organization.
                </p>
              </div>
            </div>

            {createSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-status-green/15 border border-status-green/25 text-status-green text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {createSuccess}
              </div>
            )}
            {createError && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/15 border border-destructive/25 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Recipient Organization
                </label>
                <select
                  value={form.companyId}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Amount Due (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amountDue}
                    onChange={(e) => setForm({ ...form, amountDue: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Invoice Notes / Itemization
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Monthly subscription for Professional tier with custom add-on storage"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Receipt className="h-3.5 w-3.5" />
                  )}
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice Printable Receipt Modal */}
      <InvoiceReceiptModal
        invoice={selectedInvoice}
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
      />
    </div>
  );
}
