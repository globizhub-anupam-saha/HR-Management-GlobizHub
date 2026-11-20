"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowRight } from "lucide-react";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-card/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-lg shadow-black/5 dark:shadow-black/40 border-b border-border/80 py-3"
          : "bg-card/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-border/40 py-4"
      )}
    >
      <div className="flex items-center justify-between px-6 max-w-7xl mx-auto">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 text-2xl font-bold tracking-tight hover:opacity-95 transition-opacity">
          <Logo variant="text-lockup" size="md" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-1 text-sm font-medium">
          <Link href="#core-hr" className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200">
            Core HR
          </Link>
          <Link href="#attendance" className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200">
            Attendance &amp; Leave
          </Link>
          <Link href="#payroll" className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200">
            Payroll &amp; Payslips
          </Link>
          <Link href="#operations" className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200">
            Shifts &amp; Tasks
          </Link>
          <Link href="#onboarding" className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200">
            Onboarding
          </Link>
          <Link href="#faq" className="px-3.5 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-200">
            FAQ
          </Link>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted/70 font-semibold text-sm rounded-xl px-4 h-10 transition-all">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary hover:bg-primary/90 text-slate-900 font-bold px-5 h-10 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer inline-flex items-center gap-1.5">
              Get Started
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground hover:bg-muted/70 rounded-xl transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card/95 backdrop-blur-2xl border-b border-border shadow-2xl px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1 font-medium text-sm">
            <Link href="#core-hr" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Core HR &amp; Directory</Link>
            <Link href="#attendance" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Attendance &amp; Leaves</Link>
            <Link href="#payroll" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Payroll &amp; Payslips</Link>
            <Link href="#operations" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Shifts &amp; Tasks</Link>
            <Link href="#onboarding" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">Onboarding &amp; Documents</Link>
            <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">FAQ &amp; Help</Link>
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-2.5">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center h-11 rounded-xl">Sign In</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center h-11 rounded-xl bg-primary hover:bg-primary/90 text-slate-900 font-bold shadow-md shadow-primary/20">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
