"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Users, Check, ChevronRight } from "lucide-react";

export default function CoreHRSection() {
  return (
    <section id="core-hr" className="py-24 bg-card/30 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal animation="fade-up">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Mockup Card */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-card border border-border hover:border-primary/30 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                      <Users className="w-5 h-5 text-slate-900 dark:text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Employee Directory</h4>
                      <p className="text-xs text-muted-foreground">Department &amp; Designation Breakdown</p>
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
                      <div className="w-10 h-10 rounded-full bg-primary text-slate-900 font-bold flex items-center justify-center text-sm shadow-sm">AR</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-foreground">Alex Rivera</h5>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold rounded">Engineering</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Senior Full Stack Developer • Full Time</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">Active</span>
                  </div>

                  <div className="p-4 bg-muted/40 rounded-xl border border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center text-sm shadow-sm">SD</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-foreground">Sarah Davis</h5>
                          <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold rounded">Human Resources</span>
                        </div>
                        <p className="text-xs text-muted-foreground">HR Operations Lead • Admin Access</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">Active</span>
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
                    <p className="font-bold text-foreground text-sm mt-0.5">Admin &amp; Staff</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Text Content */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-6 text-left reveal-on-scroll delay-100">
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
                  <Check className="w-4 h-4 text-primary font-bold" /> Comprehensive employee profiles &amp; bank account details
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                  <Check className="w-4 h-4 text-primary font-bold" /> Custom department &amp; designation hierarchy structures
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
        </ScrollReveal>
      </div>
    </section>
  );
}
