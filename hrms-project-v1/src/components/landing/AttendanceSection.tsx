"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Clock, CheckCircle2, ChevronRight } from "lucide-react";

export default function AttendanceSection() {
  return (
    <section id="attendance" className="py-24 bg-background border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal animation="fade-up">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Text Content */}
            <div className="lg:col-span-5 space-y-6 text-left reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30">
                <Clock className="w-3.5 h-3.5" /> Attendance &amp; Leave System
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Accurate time tracking, overtime &amp; seamless leave approvals
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
                  Learn about Attendance &amp; Leaves <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Mockup Card */}
            <div className="lg:col-span-7">
              <div className="bg-card border border-border hover:border-primary/30 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative">

                {/* Header Strip */}
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-foreground">Today&apos;s Attendance &amp; Pending Leaves</span>
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
        </ScrollReveal>
      </div>
    </section>
  );
}
