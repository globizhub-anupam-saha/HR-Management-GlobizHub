"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  ArrowRight,
  Clock,
  Banknote,
  CheckCircle2,
  ArrowLeftRight,
  UserPlus,
  Building,
} from "lucide-react";

export default function HeroSection() {
  return (
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
          Manage employee records, track time &amp; overtime, approve leave requests, coordinate shift rosters, assign tasks, and run 1-click payroll with automated payslip generation.
        </p>

        {/* Dual Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="h-13 px-8 text-base bg-primary hover:bg-primary/90 text-slate-900 font-bold shadow-xl shadow-primary/20 rounded-xl w-full sm:w-auto cursor-pointer">
              Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
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
        <ScrollReveal animation="fade-up" delay={150}>
          <div className="mt-16 pt-12 border-t border-border/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-card/60 rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <div className="p-2 w-10 h-10 mx-auto mb-3 bg-primary/20 rounded-xl flex items-center justify-center text-slate-900 dark:text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground">Accurate Attendance</h4>
              <p className="text-xs text-muted-foreground mt-1">Clock-in, breaks &amp; overtime logs</p>
            </div>
            <div className="p-4 bg-card/60 rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <div className="p-2 w-10 h-10 mx-auto mb-3 bg-primary/20 rounded-xl flex items-center justify-center text-slate-900 dark:text-primary">
                <Banknote className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground">1-Click Payroll</h4>
              <p className="text-xs text-muted-foreground mt-1">Salary components &amp; payslips</p>
            </div>
            <div className="p-4 bg-card/60 rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <div className="p-2 w-10 h-10 mx-auto mb-3 bg-primary/20 rounded-xl flex items-center justify-center text-slate-900 dark:text-primary">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground">Shift Management</h4>
              <p className="text-xs text-muted-foreground mt-1">Schedules &amp; peer shift swaps</p>
            </div>
            <div className="p-4 bg-card/60 rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <div className="p-2 w-10 h-10 mx-auto mb-3 bg-primary/20 rounded-xl flex items-center justify-center text-slate-900 dark:text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-foreground">Easy Onboarding</h4>
              <p className="text-xs text-muted-foreground mt-1">10-step company setup wizard</p>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
