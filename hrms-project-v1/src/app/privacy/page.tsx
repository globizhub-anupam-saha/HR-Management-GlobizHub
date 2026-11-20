import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | GlobizHR",
  description: "Privacy Policy for GlobizHR - A product of Globizhub India Pvt Ltd",
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Legal & Compliance
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-slate-400 mt-2">
            Last updated: November 2026 • GlobizHR (A Product of Globizhub India Pvt Ltd)
          </p>
        </div>

        <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
            1. Information We Collect
          </h2>
          <p>
            GlobizHR, operated by <strong>Globizhub India Pvt Ltd</strong>, collects and processes corporate and personal information necessary to deliver enterprise HRMS, payroll, attendance, leave, shift scheduling, and statutory compliance management services.
          </p>
          <p>
            This information includes employee demographic records, identity credentials, contact details, attendance timestamps, leave requests, compensation benchmarks, and bank details for payroll direct deposit.
          </p>

          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2 pt-4">
            2. Data Security & Storage
          </h2>
          <p>
            All tenant database records are strictly isolated using multi-tenant architecture and encrypted at rest using AES-256 and in transit via TLS 1.3. We do not sell, rent, or monetize employee records with external third-party data brokers.
          </p>

          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2 pt-4">
            3. Contact & Inquiries
          </h2>
          <p>
            If you have questions regarding this Privacy Policy or your personal data rights, please contact our Data Protection Officer at:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <p className="font-bold text-white">Globizhub India Pvt Ltd</p>
            <p className="text-slate-400">Email: legal@globizhub.com | privacy@globizhr.com</p>
            <p className="text-slate-400">Support: support@globizhr.com</p>
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
