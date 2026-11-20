import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Refund Policy | GlobizHR",
  description: "Subscription and Refund Policy for GlobizHR - A product of Globizhub India Pvt Ltd",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to GlobizHR
          </Link>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Billing & Refunds
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Refund Policy</h1>
          <p className="text-sm text-slate-400 mt-2">
            Last updated: November 2026 • GlobizHR (A Product of Globizhub India Pvt Ltd)
          </p>
        </div>

        <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
            1. Free Trial & Evaluation
          </h2>
          <p>
            GlobizHR offers a 14-day free trial on selected subscription plans, allowing enterprises to test all payroll, attendance, leave, and shift features without upfront financial commitment.
          </p>

          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2 pt-4">
            2. Subscription Billing & Cancellations
          </h2>
          <p>
            Paid subscriptions (Monthly or Annual) are billed in advance. You may cancel your organization subscription at any time from <strong>Settings &gt; Billing & Subscription</strong>. Upon cancellation, your access remains active until the end of your prepaid billing period, with no subsequent charges.
          </p>

          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2 pt-4">
            3. Refund Eligibility
          </h2>
          <p>
            Refund requests submitted within 7 business days of an initial paid subscription renewal are eligible for review if platform service was materially interrupted or inaccessible. For refund inquiries, please contact our billing team at:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <p className="font-bold text-white">Globizhub India Pvt Ltd - Billing Desk</p>
            <p className="text-slate-400">Email: billing@globizhub.com | support@globizhr.com</p>
          </div>
        </section>

        <footer className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} GlobizHR. All rights reserved.</span>
          <span>A Product of Globizhub India Pvt Ltd</span>
        </footer>
      </main>
    </div>
  );
}
