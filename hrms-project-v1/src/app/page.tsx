"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Users,
  Clock,
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Smartphone,
  Star,
  Check,
  Lock,
  MessageSquare,
  FileCheck2,
  Layers,
  ArrowUpRight,
  Download,
  Building,
  RefreshCw,
  FolderLock,
  ListTodo,
  Megaphone,
  UserPlus,
  ArrowLeftRight,
  ShieldAlert,
  ClipboardList
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moduleTab, setModuleTab] = useState<"shifts" | "tasks" | "onboarding" | "documents">("shifts");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What core features are included in GlobizHR?",
      a: "GlobizHR unifies your complete workforce operations: Employee Directory with Role-Based Access Control, Attendance & Overtime tracking, Leave approvals with holiday calendars, Shift scheduling & peer shift swaps, 1-click Payroll with downloadable payslips, Employee Onboarding with document verification, Task management, and Company announcements.",
    },
    {
      q: "How does the Payroll engine calculate salaries and deductions?",
      a: "Our payroll engine calculates earnings based on configured salary structures (Basic Pay, HRA, custom allowances) and automatically factors in approved leaves, Loss-of-Pay (LOP) attendance deductions, and statutory taxes — generating printable, encrypted employee payslips with one click.",
    },
    {
      q: "Can employees request shift swaps with their colleagues?",
      a: "Yes! GlobizHR includes a native Shift Swap module. Employees can view team rosters, propose a shift swap with a co-worker, and route the exchange to their manager for final sign-off.",
    },
    {
      q: "How does the Attendance and Overtime system work?",
      a: "Employees clock in and out directly via web or mobile. GlobizHR automatically computes daily working hours, break durations, and overtime thresholds, updating monthly payroll records in real time.",
    },
    {
      q: "How is company and employee data secured?",
      a: "GlobizHR implements strict Role-Based Access Control (RBAC), password hashing, secure cloud storage for documents, and immutable administrative audit logs that record every change across your organization.",
    },
    {
      q: "Can employees access self-service features on mobile?",
      a: "Yes. With our built-in mobile support, employees can mark attendance, check leave balances, submit leave and shift-swap requests, view company announcements, and download their monthly payslips from any device.",
    },
  ];

  return (
    <main className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-foreground text-foreground antialiased">
      
      {/* ========================================================================= */}
      {/* 1. TOP UTILITY BAR & RESPONSIVE NAVBAR */}
      {/* ========================================================================= */}
     

      <nav className="sticky top-0 z-50 w-full bg-card/85 backdrop-blur-xl border-b border-border transition-all">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 text-2xl font-bold tracking-tight">
            <div className="p-2.5 bg-primary rounded-xl text-slate-900 shadow-md shadow-primary/25 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                GlobizHR
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <Link href="#core-hr" className="hover:text-foreground transition-colors">Core HR</Link>
            <Link href="#attendance" className="hover:text-foreground transition-colors">Attendance & Leave</Link>
            <Link href="#payroll" className="hover:text-foreground transition-colors">Payroll & Payslips</Link>
            <Link href="#operations" className="hover:text-foreground transition-colors">Shifts & Tasks</Link>
            <Link href="#onboarding" className="hover:text-foreground transition-colors">Onboarding</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-medium text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-slate-900 font-bold px-5 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-b border-border px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 font-medium text-sm">
              <Link href="#core-hr" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground py-2">Core HR & Directory</Link>
              <Link href="#attendance" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground py-2">Attendance & Leaves</Link>
              <Link href="#payroll" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground py-2">Payroll & Payslips</Link>
              <Link href="#operations" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground py-2">Shifts & Tasks</Link>
              <Link href="#onboarding" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground py-2">Onboarding & Documents</Link>
              <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground py-2">FAQ & Help</Link>
            </div>
            <div className="pt-4 border-t border-border flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">Sign In</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-primary hover:bg-primary/90 text-slate-900 font-bold">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden bg-gradient-to-b from-card via-background/40 to-background border-b border-border/40">
        
        {/* Subtle Background Mesh Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-primary/20 border border-primary/30 mb-8 shadow-sm">
            <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Modern Workforce Operating Platform</span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="text-primary-foreground font-bold">Payroll • Attendance • Shifts • Onboarding</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.12]">
            Streamline your entire HR operations <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 dark:from-white dark:via-slate-200 dark:to-primary bg-clip-text text-transparent">
              in one unified system
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal">
            Manage employee records, track time & overtime, approve leave requests, coordinate shift rosters, assign tasks, and run 1-click payroll with automated payslip generation.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="h-13 px-8 text-base bg-primary hover:bg-primary/90 text-slate-900 font-bold shadow-xl shadow-primary/20 rounded-xl w-full sm:w-auto cursor-pointer">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-13 px-8 text-base border-border bg-card/60 backdrop-blur hover:bg-muted/60 text-foreground rounded-xl w-full sm:w-auto cursor-pointer">
                Explore Dashboard
              </Button>
            </Link>
          </div>

          {/* Reassurance Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Complete Setup Wizard</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Role-Based Access Control</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Secure Cloud Document Vault</span>
          </div>

          {/* Key Feature Metric Highlights Strip */}
          <div className="mt-16 pt-12 border-t border-border/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-card/60 rounded-2xl border border-border">
              <div className="p-2 w-10 h-10 mx-auto mb-3 bg-primary/20 rounded-xl flex items-center justify-center text-slate-900 dark:text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground">Accurate Attendance</h4>
              <p className="text-xs text-muted-foreground mt-1">Clock-in, breaks & overtime logs</p>
            </div>
            <div className="p-4 bg-card/60 rounded-2xl border border-border">
              <div className="p-2 w-10 h-10 mx-auto mb-3 bg-primary/20 rounded-xl flex items-center justify-center text-slate-900 dark:text-primary">
                <Banknote className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground">1-Click Payroll</h4>
              <p className="text-xs text-muted-foreground mt-1">Salary components & payslips</p>
            </div>
            <div className="p-4 bg-card/60 rounded-2xl border border-border">
              <div className="p-2 w-10 h-10 mx-auto mb-3 bg-primary/20 rounded-xl flex items-center justify-center text-slate-900 dark:text-primary">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground">Shift Management</h4>
              <p className="text-xs text-muted-foreground mt-1">Schedules & peer shift swaps</p>
            </div>
            <div className="p-4 bg-card/60 rounded-2xl border border-border">
              <div className="p-2 w-10 h-10 mx-auto mb-3 bg-primary/20 rounded-xl flex items-center justify-center text-slate-900 dark:text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground">Easy Onboarding</h4>
              <p className="text-xs text-muted-foreground mt-1">10-step company setup wizard</p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE HR & EMPLOYEE DIRECTORY */}
      {/* ========================================================================= */}
      <section id="core-hr" className="py-24 bg-card/30 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Mockup Card */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                      <Users className="w-5 h-5 text-slate-900 dark:text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Employee Directory</h4>
                      <p className="text-xs text-muted-foreground">Department & Designation Breakdown</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-primary/20 text-slate-900 dark:text-primary rounded-full border border-primary/30">
                    RBAC Protected
                  </span>
                </div>

                {/* Directory List Simulation */}
                <div className="space-y-3">
                  <div className="p-4 bg-muted/40 rounded-xl border border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-primary text-slate-900 font-bold flex items-center justify-center text-sm shadow-sm">
                        AR
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-foreground">Alex Rivera</h5>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold rounded">
                            Engineering
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Senior Full Stack Developer • Full Time</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                      Active
                    </span>
                  </div>

                  <div className="p-4 bg-muted/40 rounded-xl border border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center text-sm shadow-sm">
                        SD
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-foreground">Sarah Davis</h5>
                          <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold rounded">
                            Human Resources
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">HR Operations Lead • Admin Access</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                      Active
                    </span>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-muted-foreground">Departments</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">8 Configured</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Designations</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">24 Roles</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Access Levels</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">Admin & Staff</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Text Content */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30">
                <Users className="w-3.5 h-3.5" /> Centralized Employee Directory
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Complete employee records and role permissions
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Maintain single-pane visibility over every team member. Store job details, emergency contacts, bank information for payroll, and department structures while enforcing fine-grained Role-Based Access Control (RBAC).
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Comprehensive employee profiles & bank account details
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Custom department & designation hierarchy structures
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Granular Admin, HR Manager, and Employee permission guards
                </div>
              </div>

              <div className="pt-4">
                <Link href="/register" className="inline-flex items-center font-bold text-primary hover:underline text-sm gap-1 cursor-pointer">
                  Explore Employee Directory <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ATTENDANCE & LEAVE MANAGEMENT */}
      {/* ========================================================================= */}
      <section id="attendance" className="py-24 bg-background border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Text Content */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30">
                <Clock className="w-3.5 h-3.5" /> Attendance & Leave System
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Accurate time tracking, overtime & seamless leave approvals
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Automate attendance tracking with clock-in/out timestamps, break logs, and overtime hours. Manage custom leave balances (Paid, Casual, Sick) and sync company holiday calendars effortlessly.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Daily Clock In / Out
                </div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Overtime Calculations
                </div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Multi-Type Leave Policies
                </div>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Holiday Calendar Sync
                </div>
              </div>

              <div className="pt-4">
                <Link href="/register" className="inline-flex items-center font-bold text-primary hover:underline text-sm gap-1 cursor-pointer">
                  Learn about Attendance & Leaves <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Mockup Card */}
            <div className="lg:col-span-7">
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl relative">
                
                {/* Header Strip */}
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-foreground">Today&apos;s Attendance & Pending Leaves</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Real-Time Sync</span>
                </div>

                {/* Clock-in Status Widget */}
                <div className="p-4 bg-muted/40 rounded-xl border border-border mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">Alex Rivera — Clocked In</h5>
                      <p className="text-xs text-muted-foreground">In: 09:02 AM • Break: 45 min • Total: 7h 45m</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded">
                    +1.2h Overtime
                  </span>
                </div>

                {/* 1-Click Leave Request Action Box */}
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground">Leave Request: Casual Leave (2 Days)</p>
                    <p className="text-xs text-muted-foreground">Submitted by Elena Rostova • Oct 14 - Oct 15</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-slate-900 font-bold text-xs h-8 flex-1 sm:flex-initial cursor-pointer">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-8 flex-1 sm:flex-initial border-border hover:bg-destructive/10 hover:text-destructive cursor-pointer">
                      Decline
                    </Button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PAYROLL & PAYSLIP ENGINE */}
      {/* ========================================================================= */}
      <section id="payroll" className="py-24 bg-card/40 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Interactive Mockup Card */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">Monthly Payroll Execution</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full border border-emerald-500/30">
                        100% Calculated
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Automated salary components & loss-of-pay deductions</p>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-slate-900 font-bold text-xs h-8 cursor-pointer">
                    Process Payroll
                  </Button>
                </div>

                {/* Salary Breakdown Components */}
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-muted/40 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground font-medium">Basic Pay + HRA</p>
                    <h5 className="text-lg font-black text-foreground mt-1">$284,500.00</h5>
                    <span className="text-[10px] text-muted-foreground">Configured Formulas</span>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground font-medium">Allowances & Bonuses</p>
                    <h5 className="text-lg font-black text-foreground mt-1">$42,300.00</h5>
                    <span className="text-[10px] text-emerald-600 font-semibold">Special Allowances</span>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground font-medium">Tax & LOP Deductions</p>
                    <h5 className="text-lg font-black text-foreground mt-1">-$18,650.00</h5>
                    <span className="text-[10px] text-amber-600 font-semibold">Loss of Pay Adjusted</span>
                  </div>
                </div>

                {/* Payslip Download Simulation Widget */}
                <div className="p-4 bg-muted/30 border border-border/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 text-slate-900 dark:text-primary rounded-lg">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Employee Payslip PDF Available</p>
                      <p className="text-[11px] text-muted-foreground">Self-service payslip download in employee portal</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </Button>
                </div>

              </div>
            </div>

            {/* Right Text Content */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30">
                <Banknote className="w-3.5 h-3.5" /> Payroll & Salary Engine
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Accurate, 1-click payroll processing and instant payslips
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Configure customizable salary structures with Basic Pay, HRA, Medical & Travel Allowances, and Provident Fund deductions. Automatically deduct Loss of Pay (LOP) for unapproved leaves and generate printable employee payslips instantly.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Customizable earnings and deduction salary components
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Automatic Loss-of-Pay (LOP) leave calculations
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Employee self-service payslip history and PDF downloads
                </div>
              </div>

              <div className="pt-4">
                <Link href="/register" className="inline-flex items-center font-bold text-primary hover:underline text-sm gap-1 cursor-pointer">
                  See Payroll Features in Action <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SHIFTS, SCHEDULES, TASKS & ONBOARDING (INTERACTIVE TABS) */}
      {/* ========================================================================= */}
      <section id="operations" className="py-24 bg-background border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30 mb-4">
              <Layers className="w-3.5 h-3.5" /> Operations & Workplace Hub
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Manage shifts, tasks, and onboarding in one place
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Keep your team synchronized with flexible shift rosters, peer shift-swaps, company-wide announcements, and document management.
            </p>
          </div>

          {/* Interactive Tab Pills */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
            <button
              onClick={() => setModuleTab("shifts")}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer ${
                moduleTab === "shifts"
                  ? "bg-primary text-slate-900 shadow-md shadow-primary/20"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted"
              }`}
            >
              Shifts & Shift Swaps
            </button>
            <button
              onClick={() => setModuleTab("tasks")}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer ${
                moduleTab === "tasks"
                  ? "bg-primary text-slate-900 shadow-md shadow-primary/20"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted"
              }`}
            >
              Task Management
            </button>
            <button
              onClick={() => setModuleTab("onboarding")}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer ${
                moduleTab === "onboarding"
                  ? "bg-primary text-slate-900 shadow-md shadow-primary/20"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted"
              }`}
            >
              Company Setup Wizard
            </button>
            <button
              onClick={() => setModuleTab("documents")}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all cursor-pointer ${
                moduleTab === "documents"
                  ? "bg-primary text-slate-900 shadow-md shadow-primary/20"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted"
              }`}
            >
              Secure Document Vault
            </button>
          </div>

          {/* Dynamic Interactive Card Content */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-xl max-w-5xl mx-auto">
            
            {moduleTab === "shifts" && (
              <div className="grid md:grid-cols-12 gap-8 items-center text-left">
                <div className="md:col-span-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <ArrowLeftRight className="w-4 h-4" /> Shift Roster & Peer Swaps
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Flexible Shift Rostering & Swap Requests</h3>
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
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded">
                      Active Shift
                    </span>
                  </div>

                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Shift Swap Proposal: Friday Night</p>
                      <p className="text-[11px] text-muted-foreground">Alex Rivera ⇄ Marcus Vance</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-slate-900 rounded">
                      Manager Approved
                    </span>
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
                  <h3 className="text-2xl font-bold text-foreground">Assign, Track & Complete Internal Tasks</h3>
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
                  <h3 className="text-2xl font-bold text-foreground">Secure Storage for Identity & Policy Docs</h3>
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

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. MOBILE APP COMPANION */}
      {/* ========================================================================= */}
      <section className="py-24 bg-card/60 border-b border-border/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30">
                <Smartphone className="w-3.5 h-3.5" /> Mobile Self-Service
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                Empower your employees on web & mobile
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Employees can manage their daily work life on the go. Clock in, apply for leaves, view company announcements, check upcoming shifts, and download payslips directly from their mobile device.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Mobile attendance clock-in with daily work timer
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> 1-tap leave applications & shift swap submissions
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Instant access to monthly payslip history
                </div>
              </div>

              <div className="pt-4">
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary/90 text-slate-900 font-bold px-6 rounded-xl cursor-pointer">
                    Open Employee Portal <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-[300px] sm:w-[320px] bg-slate-950 rounded-[44px] p-4 border-[6px] border-slate-800 shadow-2xl relative">
                {/* Dynamic Island / Notch */}
                <div className="w-24 h-5 bg-slate-800 rounded-full mx-auto mb-4" />
                
                {/* Phone Screen Mockup */}
                <div className="bg-slate-900 rounded-[30px] p-5 text-left text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400">Welcome,</p>
                      <h5 className="font-bold text-sm text-white">Alex Rivera</h5>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/30 text-primary font-bold flex items-center justify-center text-xs border border-primary/40">
                      AR
                    </div>
                  </div>

                  {/* Punch In Widget */}
                  <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center space-y-2">
                    <p className="text-[11px] font-mono text-slate-400">09:14:22 AM</p>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                      <Check className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-emerald-400">Attendance: Clocked In</p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
                      <span className="text-[10px] font-semibold text-slate-300">Request Leave</span>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <Banknote className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                      <span className="text-[10px] font-semibold text-slate-300">My Payslips</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-4" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SECURITY & AUDIT TRAIL BANNER */}
      {/* ========================================================================= */}
      <section id="security" className="py-20 bg-card border-y border-border/80">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center md:text-left items-center">
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="p-3 bg-primary/20 text-slate-900 dark:text-primary rounded-2xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Role-Based Access Control</h4>
              <p className="text-sm text-muted-foreground">Admin, HR Manager, and Staff permission guards.</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Immutable Audit Logs</h4>
              <p className="text-sm text-muted-foreground">Full activity logs for administrative traceability.</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
              <FolderLock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Encrypted Document Vault</h4>
              <p className="text-sm text-muted-foreground">Secure cloud storage for employee files & IDs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. INTERACTIVE FAQ ACCORDION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-24 bg-background border-b border-border/60">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30 mb-4">
              <MessageSquare className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Everything you need to know
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Clear answers about employee setup, payroll formulas, shift swaps, and security.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base md:text-lg text-foreground cursor-pointer hover:text-primary transition-colors"
                  >
                    <span>{item.q}</span>
                    <div className="p-1 rounded-lg bg-muted text-muted-foreground">
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm md:text-base text-muted-foreground leading-relaxed border-t border-border/40 animate-in fade-in-50 duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            Need assistance setting up your organization?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Get started with our 10-step wizard →
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. HIGH-CONVERSION BOTTOM CTA BANNER */}
      {/* ========================================================================= */}
      <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 mb-8">
            <CheckCircle2 className="w-3.5 h-3.5" /> Start Free Today • No Setup Fees
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Ready to upgrade your HR <br className="hidden sm:block" />
            and payroll operations?
          </h2>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join modern organizations that manage attendance, leaves, shifts, and payroll effortlessly with GlobizHR.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-8 text-base bg-primary hover:bg-primary/90 text-slate-950 font-bold shadow-xl shadow-primary/30 rounded-xl w-full sm:w-auto cursor-pointer">
                Start Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-white rounded-xl w-full sm:w-auto cursor-pointer">
                Sign In to Portal
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 10-Step Setup Wizard</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-Department Support</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Secure Role-Based Access</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. ENTERPRISE FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          
          {/* Main Footer Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary rounded-xl text-slate-950 shadow-lg shadow-primary/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="text-white text-xl font-extrabold tracking-tight">
                  GlobizHR
                </span>
              </div>

              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                The modern operating system for HR teams. Streamline payroll, attendance, leave management, shift rosters, and employee records in one secure platform.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-primary hover:text-slate-950 transition-all text-slate-300" aria-label="LinkedIn">
                  in
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-primary hover:text-slate-950 transition-all text-slate-300" aria-label="Twitter">
                  𝕏
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-primary hover:text-slate-950 transition-all text-slate-300" aria-label="GitHub">
                  git
                </a>
              </div>
            </div>

            {/* Modules Column */}
            <div>
              <h5 className="text-white font-bold text-sm mb-4">Core Modules</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#core-hr" className="hover:text-primary transition-colors">Employee Directory</Link></li>
                <li><Link href="#attendance" className="hover:text-primary transition-colors">Time & Attendance</Link></li>
                <li><Link href="#attendance" className="hover:text-primary transition-colors">Leave Management</Link></li>
                <li><Link href="#operations" className="hover:text-primary transition-colors">Shift Rostering</Link></li>
                <li><Link href="#operations" className="hover:text-primary transition-colors">Peer Shift Swaps</Link></li>
              </ul>
            </div>

            {/* Payroll & Tools */}
            <div>
              <h5 className="text-white font-bold text-sm mb-4">Payroll & Ops</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#payroll" className="hover:text-primary transition-colors">Payroll Processing</Link></li>
                <li><Link href="#payroll" className="hover:text-primary transition-colors">Payslip Downloads</Link></li>
                <li><Link href="#operations" className="hover:text-primary transition-colors">Task Management</Link></li>
                <li><Link href="#operations" className="hover:text-primary transition-colors">Document Vault</Link></li>
                <li><Link href="#onboarding" className="hover:text-primary transition-colors">Setup Wizard</Link></li>
              </ul>
            </div>

            {/* Security & Access */}
            <div>
              <h5 className="text-white font-bold text-sm mb-4">Security & Portal</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#security" className="hover:text-primary transition-colors">Audit Logging</Link></li>
                <li><Link href="#security" className="hover:text-primary transition-colors">Role-Based Access (RBAC)</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Employee Portal</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">Register Organization</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} GlobizHR. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Audit Integrity</span>
            </div>
          </div>

        </div>
      </footer>

    </main>
  );
}