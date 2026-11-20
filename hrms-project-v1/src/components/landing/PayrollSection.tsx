"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Banknote, Check, ChevronRight, Download } from "lucide-react";

export default function PayrollSection() {
  return (
    <section id="payroll" className="py-24 bg-card/40 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal animation="fade-up">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Interactive Mockup Card */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-card border border-border hover:border-primary/30 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">Monthly Payroll Execution</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full border border-emerald-500/30">
                        100% Calculated
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Automated salary components &amp; loss-of-pay deductions</p>
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
                    <p className="text-xs text-muted-foreground font-medium">Allowances &amp; Bonuses</p>
                    <h5 className="text-lg font-black text-foreground mt-1">$42,300.00</h5>
                    <span className="text-[10px] text-emerald-600 font-semibold">Special Allowances</span>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground font-medium">Tax &amp; LOP Deductions</p>
                    <h5 className="text-lg font-black text-foreground mt-1">-$18,650.00</h5>
                    <span className="text-[10px] text-amber-600 font-semibold">Loss of Pay Adjusted</span>
                  </div>
                </div>

                {/* Payslip Download Widget */}
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
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-6 text-left reveal-on-scroll delay-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-slate-900 dark:text-primary border border-primary/30">
                <Banknote className="w-3.5 h-3.5" /> Payroll &amp; Salary Engine
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Accurate, 1-click payroll processing and instant payslips
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Configure customizable salary structures with Basic Pay, HRA, Medical &amp; Travel Allowances, and Provident Fund deductions. Automatically deduct Loss of Pay (LOP) for unapproved leaves and generate printable employee payslips instantly.
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
        </ScrollReveal>
      </div>
    </section>
  );
}
