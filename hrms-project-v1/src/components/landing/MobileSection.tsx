"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Smartphone, Check, ArrowRight, Calendar, Banknote } from "lucide-react";

export default function MobileSection() {
  return (
    <section className="py-24 bg-card/60 border-b border-border/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal animation="fade-up">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-6 space-y-6 text-left reveal-on-scroll">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30">
                <Smartphone className="w-3.5 h-3.5" /> Mobile Self-Service
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                Empower your employees on web &amp; mobile
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Employees can manage their daily work life on the go. Clock in, apply for leaves, view company announcements, check upcoming shifts, and download payslips directly from their mobile device.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Mobile attendance clock-in with daily work timer
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> 1-tap leave applications &amp; shift swap submissions
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
            <div className="lg:col-span-6 flex justify-center reveal-on-scroll delay-100">
              <div className="w-[300px] sm:w-[320px] bg-slate-950 rounded-[44px] p-4 border-[6px] border-slate-800 shadow-2xl relative">
                {/* Dynamic Island */}
                <div className="w-24 h-5 bg-slate-800 rounded-full mx-auto mb-4" />

                {/* Phone Screen */}
                <div className="bg-slate-900 rounded-[30px] p-5 text-left text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400">Welcome,</p>
                      <h5 className="font-bold text-sm text-white">Alex Rivera</h5>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/30 text-primary font-bold flex items-center justify-center text-xs border border-primary/40">AR</div>
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

                {/* Home Indicator */}
                <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-4" />
              </div>
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
