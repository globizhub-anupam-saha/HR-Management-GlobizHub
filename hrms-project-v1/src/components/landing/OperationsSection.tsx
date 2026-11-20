"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  Layers,
  ArrowLeftRight,
  ListTodo,
  UserPlus,
  FolderLock,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

export default function OperationsSection() {
  const [moduleTab, setModuleTab] = useState<"shifts" | "tasks" | "onboarding" | "documents">("shifts");

  return (
    <section id="operations" className="py-24 bg-background border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal animation="fade-up">

          <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30 mb-4">
              <Layers className="w-3.5 h-3.5" /> Operations &amp; Workplace Hub
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Manage shifts, tasks, and onboarding in one place
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Keep your team synchronized with flexible shift rosters, peer shift-swaps, company-wide announcements, and document management.
            </p>
          </div>

          {/* Interactive Tab Pills */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 reveal-on-scroll delay-100">
            {(["shifts", "tasks", "onboarding", "documents"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setModuleTab(tab)}
                className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  moduleTab === tab
                    ? "bg-primary text-slate-900 shadow-md shadow-primary/20"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab === "shifts" && "Shifts & Shift Swaps"}
                {tab === "tasks" && "Task Management"}
                {tab === "onboarding" && "Company Setup Wizard"}
                {tab === "documents" && "Secure Document Vault"}
              </button>
            ))}
          </div>

          {/* Dynamic Interactive Card Content */}
          <div className="bg-card border border-border hover:border-primary/30 rounded-2xl p-6 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-5xl mx-auto">

            {moduleTab === "shifts" && (
              <div className="grid md:grid-cols-12 gap-8 items-center text-left">
                <div className="md:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <ArrowLeftRight className="w-4 h-4" /> Shift Roster &amp; Peer Swaps
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Flexible Shift Rostering &amp; Swap Requests</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create rotational morning, evening, and night shift schedules. Empower team members to request shift swaps with co-workers, routed directly to managers for one-click approval.
                  </p>
                  <div className="pt-2">
                    <Link href="/register">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-slate-900 font-bold text-xs rounded-lg cursor-pointer">
                        View Shift Scheduler
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="md:col-span-6 bg-muted/40 p-5 rounded-xl border border-border space-y-3">
                  <div className="p-3 bg-card rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Morning Shift (08:00 - 16:00)</p>
                      <p className="text-[11px] text-muted-foreground">Assigned to: Alex Rivera, Sarah Davis</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">Active Shift</span>
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Shift Swap Proposal: Friday Night</p>
                      <p className="text-[11px] text-muted-foreground">Alex Rivera ⇄ Marcus Vance</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-slate-900 rounded">Manager Approved</span>
                  </div>
                </div>
              </div>
            )}

            {moduleTab === "tasks" && (
              <div className="grid md:grid-cols-12 gap-8 items-center text-left">
                <div className="md:col-span-6 space-y-4">
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <ListTodo className="w-4 h-4" /> Team Task Coordination
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Assign, Track &amp; Complete Internal Tasks</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Keep teams aligned with actionable tasks, priority flags (High, Medium, Low), due dates, and real-time status updates (To Do, In Progress, Done).
                  </p>
                </div>
                <div className="md:col-span-6 space-y-2.5">
                  <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Verify Q4 Statutory Tax Documents</p>
                        <p className="text-[11px] text-muted-foreground">Assigned to: Sarah Davis • Priority: High</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">Done</span>
                  </div>
                  <div className="p-3.5 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-primary" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Setup New Hire Workstations</p>
                        <p className="text-[11px] text-muted-foreground">Assigned to: IT Support • Due Tomorrow</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/20 text-slate-900 dark:text-primary rounded">In Progress</span>
                  </div>
                </div>
              </div>
            )}

            {moduleTab === "onboarding" && (
              <div className="grid md:grid-cols-12 gap-8 items-center text-left">
                <div className="md:col-span-6 space-y-4">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> 10-Step Company Setup
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Complete Guided Organization Setup</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Set up your complete organization in minutes: Company Info, Holiday Calendars, Work Weeks, Leave Policies, Salary Components, Departments, and Employee Invites.
                  </p>
                </div>
                <div className="md:col-span-6 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="text-xs font-bold text-foreground">1. Company Profile</span>
                    <p className="text-[11px] text-emerald-600 mt-1">✓ Completed</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="text-xs font-bold text-foreground">2. Holiday Calendar</span>
                    <p className="text-[11px] text-emerald-600 mt-1">✓ Configured</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="text-xs font-bold text-foreground">3. Salary Components</span>
                    <p className="text-[11px] text-emerald-600 mt-1">✓ Basic, HRA, PF</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <span className="text-xs font-bold text-foreground">4. Invite Employees</span>
                    <p className="text-[11px] text-primary font-bold mt-1">1-Click Email Invites</p>
                  </div>
                </div>
              </div>
            )}

            {moduleTab === "documents" && (
              <div className="grid md:grid-cols-12 gap-8 items-center text-left">
                <div className="md:col-span-6 space-y-4">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <FolderLock className="w-4 h-4" /> Cloud Document Repository
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Secure Storage for Identity &amp; Policy Docs</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Securely upload and verify employee identification documents, educational certificates, and employment contracts stored on AWS S3 with encrypted cloud access.
                  </p>
                </div>
                <div className="md:col-span-6 space-y-2.5">
                  <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-medium text-foreground">Employment_Contract_Signed.pdf</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Verified</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-medium text-foreground">Government_ID_Verification.pdf</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Encrypted</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </ScrollReveal>
      </div>
    </section>
  );
}
