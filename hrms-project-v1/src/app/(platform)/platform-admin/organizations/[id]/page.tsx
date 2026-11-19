"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import platformApi from "@/lib/platform-api";
import { ControlledAccessModal } from "@/components/platform/ControlledAccessModal";
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Ban,
  ShieldAlert,
  Loader2,
  Users,
  CreditCard,
  HardDrive,
  History,
  Receipt,
  Shield,
  LifeBuoy,
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  AlertCircle,
  Hash,
  ExternalLink,
  Lock,
} from "lucide-react";

type TabKey =
  | "overview"
  | "companyInfo"
  | "subscription"
  | "employees"
  | "usage"
  | "activity"
  | "billing"
  | "security"
  | "support";

export default function OrganizationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await platformApi.get(`/platform/organizations/${id}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load organization details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (
    newStatus: "VERIFIED" | "SUSPENDED" | "PENDING_VERIFICATION",
    reason?: string
  ) => {
    setIsActionLoading(true);
    try {
      await platformApi.patch(`/platform/organizations/${id}/status`, {
        status: newStatus,
        reason: reason || `Admin transitioned status to ${newStatus}`,
      });
      await fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update organization status");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
        <p className="text-xs text-muted-foreground">Loading organization records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/25 text-destructive text-sm">
          {error || "Organization not found."}
        </div>
        <Link
          href="/platform-admin/organizations"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-foreground underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Organizations</span>
        </Link>
      </div>
    );
  }

  const { overview, companyInfo, subscription, employees, usage, activityHistory, billingHistory, security, support } = data;

  const TABS: { key: TabKey; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: Building2 },
    { key: "companyInfo", label: "Company Info", icon: FileText },
    { key: "subscription", label: "Subscription", icon: CreditCard },
    { key: "employees", label: "Employees", icon: Users },
    { key: "usage", label: "Usage & Storage", icon: HardDrive },
    { key: "activity", label: "Activity History", icon: History },
    { key: "billing", label: "Billing History", icon: Receipt },
    { key: "security", label: "Security & Policy", icon: Shield },
    { key: "support", label: "Support Tickets", icon: LifeBuoy },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/platform-admin/organizations"
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{overview.name}</h1>
              {overview.status === "VERIFIED" || overview.status === "ACTIVE" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-green/15 text-status-green border border-status-green/25">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Active</span>
                </span>
              ) : overview.status === "SUSPENDED" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-destructive/15 text-destructive border border-destructive/25">
                  <Ban className="h-3 w-3" />
                  <span>Suspended</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-status-orange/15 text-status-orange border border-status-orange/25">
                  <Clock className="h-3 w-3" />
                  <span>Pending Approval</span>
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              ID: {overview.id} · Slug: {overview.slug}
            </p>
          </div>
        </div>

        {/* Global Tenant Operations */}
        <div className="flex items-center gap-2">
          {/* Controlled Diagnostic Session */}
          <button
            type="button"
            onClick={() => setIsDiagnosticModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-status-orange/15 hover:bg-status-orange/25 text-status-orange border border-amber-500/30 text-xs font-semibold transition-colors"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Diagnostic Support Session</span>
          </button>

          {/* Approve Button if pending */}
          {overview.status === "PENDING_VERIFICATION" && (
            <button
              disabled={isActionLoading}
              onClick={() => handleStatusChange("VERIFIED", "Approved by platform administrator")}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Approve Organization
            </button>
          )}

          {/* Suspend or Reactivate */}
          {overview.status === "VERIFIED" && (
            <button
              disabled={isActionLoading}
              onClick={() => {
                const reason = prompt("Enter suspension reason (mandatory):");
                if (reason) handleStatusChange("SUSPENDED", reason);
              }}
              className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-destructive hover:bg-destructive/15 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Suspend Tenant
            </button>
          )}

          {overview.status === "SUSPENDED" && (
            <button
              disabled={isActionLoading}
              onClick={() => handleStatusChange("VERIFIED", "Reactivated by platform administrator")}
              className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Reactivate Tenant
            </button>
          )}
        </div>
      </div>

      {/* 9 Tabs Navigation Strip */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap rounded-xl transition-all ${
                isActive
                  ? "bg-sky-500/15 text-foreground border border-primary/30 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Employees", value: overview.employeeCount, icon: Users, color: "text-primary" },
              { label: "Departments", value: overview.departmentCount, icon: Building2, color: "text-indigo-400" },
              { label: "Branches", value: overview.branchCount, icon: MapPin, color: "text-teal-400" },
              { label: "Attendances Logged", value: overview.attendanceRecordsCount, icon: Calendar, color: "text-status-green" },
              { label: "Leave Requests", value: overview.leaveRequestsCount, icon: Clock, color: "text-status-orange" },
              { label: "Support Tickets", value: overview.openTicketsCount, icon: LifeBuoy, color: "text-destructive" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-[10px] uppercase font-semibold">{stat.label}</span>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className="text-xl font-bold text-foreground tracking-tight">{stat.value}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Registration Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Official Contact</span>
                  <span className="text-foreground">{companyInfo.officialEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Phone Number</span>
                  <span className="text-foreground">{companyInfo.phone || "Not provided"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Onboarded On</span>
                  <span className="text-foreground">{new Date(overview.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Last System Update</span>
                  <span className="text-foreground">{new Date(overview.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Subscription & Quota
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Current Plan</span>
                  <span className="text-foreground font-semibold">{subscription.currentPlan?.name || "Free Trial"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Billing Cycle</span>
                  <span className="text-foreground font-mono">{subscription.activeSubscription?.billingCycle || "MONTHLY"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Employee Quota Utilization</span>
                  <span className="text-foreground font-medium">
                    {usage.totalEmployees} / {usage.maxPlanEmployees} seats
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Estimated Disk Footprint</span>
                  <span className="text-foreground font-medium">{usage.estimatedStorageMb} MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Company Information */}
      {activeTab === "companyInfo" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Entity Profile</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">Legal Entity Name</span>
                <p className="text-foreground font-medium text-sm mt-0.5">{companyInfo.legalName}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">Industry</span>
                <p className="text-foreground font-medium mt-0.5">{companyInfo.industry || "Not specified"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">Company Size</span>
                <p className="text-foreground font-medium mt-0.5">{companyInfo.size || "1-50"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">Official Website</span>
                <p className="text-primary font-medium mt-0.5">
                  {companyInfo.website ? (
                    <a href={companyInfo.website} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                      {companyInfo.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : "None"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-status-green" />
              <span>Location & Tax Identifiers</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">Registered Office Address</span>
                <p className="text-foreground font-medium mt-0.5">{companyInfo.address || "No address on file"}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">City</span>
                  <p className="text-foreground font-medium">{companyInfo.city || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">State</span>
                  <p className="text-foreground font-medium">{companyInfo.state || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">Country</span>
                  <p className="text-foreground font-medium">{companyInfo.country || "India"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">GSTIN</span>
                  <p className="text-foreground font-mono font-medium">{companyInfo.gstin || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">PAN</span>
                  <p className="text-foreground font-mono font-medium">{companyInfo.pan || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Subscription */}
      {activeTab === "subscription" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Active Subscription Plan
              </span>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {subscription.currentPlan?.name || "Free Trial"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Plan Code: <span className="font-mono text-foreground">{subscription.currentPlan?.code || "PLAN_FREE"}</span> · Max Seats: {usage.maxPlanEmployees}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">
                ₹{subscription.currentPlan?.monthlyPrice || 0}
              </span>
              <span className="text-xs text-muted-foreground"> / month</span>
              <p className="text-xs text-status-green mt-1">
                Status: {subscription.activeSubscription?.status || "ACTIVE"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Subscription Transition History
            </h4>
            {subscription.history.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No subscription transitions on record.</p>
            ) : (
              <div className="divide-y divide-border/80 text-xs">
                {subscription.history.map((sub: any) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground">{sub.plan?.name || "Standard Plan"}</span>
                      <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                        Started: {new Date(sub.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Period End: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-green/15 text-status-green">
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Employees (Privacy Protected) */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border text-xs">
            <div>
              <span className="text-muted-foreground">Total Registered Employees: </span>
              <span className="font-bold text-foreground">{employees.totalCount}</span>
            </div>
            <div className="text-muted-foreground italic text-[11px] flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Confidential salary & bank account data is masked for platform administrators.</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Employee / Admin</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.keyStaff.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{emp.firstName} {emp.lastName}</div>
                      <div className="text-[10px] text-muted-foreground">{emp.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-muted text-foreground">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-status-green font-medium">{emp.employmentStatus}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(emp.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Usage & Storage */}
      {activeTab === "usage" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
            <span className="text-xs uppercase font-semibold text-muted-foreground">Seat Utilization</span>
            <div className="text-2xl font-bold text-foreground">
              {usage.totalEmployees} <span className="text-xs text-muted-foreground font-normal">/ {usage.maxPlanEmployees} max</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (usage.totalEmployees / usage.maxPlanEmployees) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
            <span className="text-xs uppercase font-semibold text-muted-foreground">Attendance Database Rows</span>
            <div className="text-2xl font-bold text-foreground">{usage.totalAttendances}</div>
            <p className="text-[11px] text-muted-foreground">Composite index scoped for fast querying</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
            <span className="text-xs uppercase font-semibold text-muted-foreground">Storage Volume (Est.)</span>
            <div className="text-2xl font-bold text-foreground">{usage.estimatedStorageMb} MB</div>
            <p className="text-[11px] text-muted-foreground">Under 5 GB plan storage limit</p>
          </div>
        </div>
      )}

      {/* Tab 6: Activity & Audit History */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              <span>Platform Administrative Actions on this Tenant</span>
            </h3>
            {activityHistory.platformEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No platform administrative events recorded.</p>
            ) : (
              <div className="divide-y divide-border/80 text-xs">
                {activityHistory.platformEvents.map((evt: any) => (
                  <div key={evt.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground">{evt.action}</span>
                      <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                        by {evt.actorEmail}
                      </span>
                      {evt.reason && (
                        <p className="text-[11px] text-status-orange/90 mt-0.5 italic">Reason: {evt.reason}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(evt.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-4 w-4" />
              <span>Internal Organization Audit Trail</span>
            </h3>
            {activityHistory.tenantEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No internal audit events on file.</p>
            ) : (
              <div className="divide-y divide-border/80 text-xs">
                {activityHistory.tenantEvents.map((evt: any) => (
                  <div key={evt.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground">{evt.action} on {evt.entity}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        by {evt.actor?.email || "System"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(evt.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 7: Billing History */}
      {activeTab === "billing" && (
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Invoices & Payment Transactions
          </h3>
          {billingHistory.invoices.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No invoices generated yet for this organization.
            </p>
          ) : (
            <div className="divide-y divide-border/80 text-xs">
              {billingHistory.invoices.map((inv: any) => (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-semibold text-foreground">{inv.invoiceNumber}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">
                      Due: {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-foreground">₹{inv.amountDue}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-green/15 text-status-green">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Security & System Settings */}
      {activeTab === "security" && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Tenant Security & Attendance Policies</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-muted-foreground text-[10px] uppercase font-semibold">Attendance Method</span>
              <p className="text-foreground font-semibold mt-0.5">{security.settings?.attendanceMethod || "GPS_OR_WIFI"}</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-muted-foreground text-[10px] uppercase font-semibold">Geo-Fencing Radius</span>
              <p className="text-foreground font-semibold mt-0.5">{security.settings?.allowedRadiusMeters || 100} Meters</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-muted-foreground text-[10px] uppercase font-semibold">One Device Per Employee</span>
              <p className="text-foreground font-semibold mt-0.5">{security.settings?.oneDevicePerEmployee ? "Enforced" : "Flexible"}</p>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-muted-foreground text-[10px] uppercase font-semibold">Session Timeout</span>
              <p className="text-foreground font-semibold mt-0.5">{security.settings?.sessionTimeoutHours || 24} Hours</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Customer Support */}
      {activeTab === "support" && (
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Support Tickets Raised by Organization
          </h3>
          {support.tickets.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No support tickets filed by this organization.
            </p>
          ) : (
            <div className="divide-y divide-border/80 text-xs">
              {support.tickets.map((tck: any) => (
                <div key={tck.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-primary">{tck.ticketNumber}</span>
                    <span className="font-semibold text-foreground ml-2">{tck.subject}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Raised by {tck.creator?.firstName} {tck.creator?.lastName} on {new Date(tck.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground">
                      {tck.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-green/15 text-status-green">
                      {tck.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controlled Diagnostic Support Access Modal */}
      <ControlledAccessModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
        organizationId={overview.id}
        organizationName={overview.name}
      />
    </div>
  );
}

