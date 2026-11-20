"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white relative overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10 reveal-on-scroll">
        <ScrollReveal animation="zoom-in">
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
        </ScrollReveal>
      </div>
    </section>
  );
}
