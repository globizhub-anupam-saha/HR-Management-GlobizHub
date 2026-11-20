"use client";

import { useState } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { MessageSquare, ChevronDown } from "lucide-react";

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

export default function FAQSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-background border-b border-border/60">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal animation="fade-up">

          <div className="text-center mb-16 reveal-on-scroll">
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

          <div className="space-y-4 reveal-on-scroll delay-100">
            {faqs.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-card border border-border hover:border-primary/40 rounded-2xl overflow-hidden transition-all shadow-sm"
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

        </ScrollReveal>
      </div>
    </section>
  );
}
