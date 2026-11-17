"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Terminal,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { platformApi } from "@/lib/platform-api";

interface SecurityEvent {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  actor: string;
  ip: string;
  timestamp: string;
}

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([
    {
      id: "sec-1",
      type: "DIAGNOSTIC_TOKEN_ISSUED",
      severity: "HIGH",
      description: "Support diagnostic session generated for tenant debugging",
      actor: "superadmin@globizhr.com",
      ip: "103.21.244.1",
      timestamp: "10 mins ago",
    },
    {
      id: "sec-2",
      type: "ROLE_ESCALATION_CHECK",
      severity: "LOW",
      description: "Permission validation passed for Super Admin endpoint invocation",
      actor: "superadmin@globizhr.com",
      ip: "103.21.244.1",
      timestamp: "35 mins ago",
    },
    {
      id: "sec-3",
      type: "BLOCKED_SUSPENDED_LOGIN",
      severity: "MEDIUM",
      description: "Employee login blocked because organization status is SUSPENDED",
      actor: "alex@nexustech.io",
      ip: "49.36.12.8",
      timestamp: "2 hours ago",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Security Events</h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-status-green/15 text-status-green border border-status-green/25">
              Active Sentinel Protection
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time security telemetry, tenant boundary isolation monitoring, and diagnostic access session audits.
          </p>
        </div>

        <Link
          href="/platform-admin/monitoring/audit-logs"
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-foreground bg-card border border-border hover:bg-muted rounded-lg transition-colors"
        >
          <Terminal className="h-3.5 w-3.5" />
          Full Audit Trail
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
            Tenant Isolation Status
          </span>
          <div className="text-xl font-bold font-mono text-status-green flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> 100% ISOLATED
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Zero cross-tenant leaks</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
            Active Diagnostic Sessions
          </span>
          <div className="text-xl font-bold font-mono text-primary">1 Active Token</div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Expires in 15 minutes</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
            Threat Sentinel Alerts
          </span>
          <div className="text-xl font-bold font-mono text-status-green">0 Critical</div>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">All systems healthy</span>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3.5 px-4">Event Type</th>
              <th className="py-3.5 px-4">Severity</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Actor</th>
              <th className="py-3.5 px-4">IP Address</th>
              <th className="py-3.5 px-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold text-foreground">{e.type}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      e.severity === "HIGH"
                        ? "bg-status-orange/15 text-status-orange border border-status-orange/25"
                        : e.severity === "CRITICAL"
                        ? "bg-destructive/15 text-destructive border border-destructive/25"
                        : "bg-primary/15 text-primary border border-primary/25"
                    }`}
                  >
                    {e.severity}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-foreground">{e.description}</td>
                <td className="py-3.5 px-4 font-mono text-muted-foreground">{e.actor}</td>
                <td className="py-3.5 px-4 font-mono text-muted-foreground">{e.ip}</td>
                <td className="py-3.5 px-4 text-right text-muted-foreground font-mono">{e.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

