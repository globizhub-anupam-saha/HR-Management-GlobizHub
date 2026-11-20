"use client";

import Link from "next/link";
import Logo from "@/components/brand/Logo";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowUp } from "lucide-react";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function LandingFooter() {
  return (
    <footer className="relative bg-slate-950 text-slate-300 border-t border-slate-800 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-36 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative z-10">
        <ScrollReveal animation="fade-up">


          {/* Main Footer Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-5">
              <Link href="/" className="inline-flex items-center gap-3.5 group">
                <div className="p-2.5 bg-white rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-105 transition-all duration-200 shrink-0">
                  <Logo variant="emblem" size="md" />
                </div>
                <div className="flex flex-col">
                  <div className="text-2xl font-black tracking-tight leading-none">
                    <span className="text-[#38BDF8]">Globiz</span>
                    <span className="text-[#F7941D]">Hr</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium mt-1 tracking-tight">
                    A complete HR management solution
                  </span>
                </div>
              </Link>

              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                The modern operating system for HR teams. Streamline payroll, attendance, leave management, shift rosters, and employee records in one secure platform.
              </p>

              {/* Live Status */}
             

              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-1">
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/globizhub-india"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-[#0A66C2] flex items-center justify-center text-white shadow-md hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-[#0A66C2]/30 transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.22a1.65 1.65 0 0 0-1.66 1.65 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.65z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/globizhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-md hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 fill-none stroke-current stroke-[2] stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/globizhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl bg-[#1877F2] flex items-center justify-center text-white shadow-md hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-[#1877F2]/30 transition-all duration-200"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Core Modules */}
            <div>
              <h5 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest mb-4 inline-block">Core Modules</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#core-hr" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Employee Directory</Link></li>
                <li><Link href="#attendance" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Time &amp; Attendance</Link></li>
                <li><Link href="#attendance" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Leave Management</Link></li>
                <li><Link href="#operations" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Shift Rostering</Link></li>
                <li><Link href="#operations" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Peer Shift Swaps</Link></li>
              </ul>
            </div>

            {/* Payroll & Ops */}
            <div>
              <h5 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest mb-4 inline-block">Payroll &amp; Ops</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#payroll" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Payroll Processing</Link></li>
                <li><Link href="#payroll" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Payslip Downloads</Link></li>
                <li><Link href="#operations" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Task Management</Link></li>
                <li><Link href="#operations" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Document Vault</Link></li>
                <li><Link href="#onboarding" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Setup Wizard</Link></li>
              </ul>
            </div>

            {/* Security & Portal */}
            <div>
              <h5 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest mb-4 inline-block">Security &amp; Portal</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#security" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Audit Logging</Link></li>
                <li><Link href="#security" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Role-Based Access (RBAC)</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Employee Portal</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Register Organization</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h5 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest mb-4 inline-block">Legal</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Terms &amp; Conditions</Link></li>
                <li><Link href="/refund-policy" className="hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block">Refund Policy</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-14 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} GlobizHR. All rights reserved.</p>

            <div className="flex flex-wrap items-center gap-2">
              <p className="text-slate-400">A product of</p>
              <a
                href="https://globizhub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors font-bold inline-flex items-center gap-1"
              >
                GlobizHub India Pvt Ltd.
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-70">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer group"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-slate-950 group-hover:border-primary transition-colors">
                <ArrowUp className="w-3 h-3" />
              </div>
            </button>
          </div>

        </ScrollReveal>
      </div>
    </footer>
  );
}
