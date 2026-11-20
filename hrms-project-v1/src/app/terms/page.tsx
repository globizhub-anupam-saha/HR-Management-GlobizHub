import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | GlobizHR",
  description: "Terms and Conditions for GlobizHR - A product of Globizhub India Pvt Ltd",
};

export default function TermsPage() {
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
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Legal & Compliance
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms & Conditions</h1>
          <p className="text-sm text-slate-400 mt-2">
            Last updated: November 2026 • GlobizHR (A Product of Globizhub India Pvt Ltd)
          </p>
        </div>

        <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By registering for, accessing, or using the GlobizHR platform and related services provided by <strong>Globizhub India Pvt Ltd</strong>, you agree to be bound by these Terms and Conditions. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity.
          </p>

          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2 pt-4">
            2. Platform Licensing & Permitted Use
          </h2>
          <p>
            Globizhub India Pvt Ltd grants the subscribing enterprise a non-exclusive, non-transferable right to access and utilize the cloud-based HRMS, payroll calculator, attendance geofencing, and employee directory modules in accordance with their purchased subscription tier.
          </p>

          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2 pt-4">
            3. Account Responsibilities
          </h2>
          <p>
            Subscribers are responsible for maintaining the confidentiality of their administrator and employee credentials, setting up role-based permissions, and ensuring lawful processing of workforce data.
          </p>
        </section>

        <footer className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} GlobizHR. All rights reserved.</span>
          <span>A Product of Globizhub India Pvt Ltd</span>
        </footer>
      </main>
    </div>
  );
}
