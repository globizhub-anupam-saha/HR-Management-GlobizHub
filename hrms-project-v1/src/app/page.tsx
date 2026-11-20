"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import CoreHRSection from "@/components/landing/CoreHRSection";
import AttendanceSection from "@/components/landing/AttendanceSection";
import PayrollSection from "@/components/landing/PayrollSection";
import OperationsSection from "@/components/landing/OperationsSection";
import MobileSection from "@/components/landing/MobileSection";
import SecurityBanner from "@/components/landing/SecurityBanner";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-foreground text-foreground antialiased">
      <LandingNavbar />
      <HeroSection />
      <CoreHRSection />
      <AttendanceSection />
      <PayrollSection />
      <OperationsSection />
      <MobileSection />
      <SecurityBanner />
      <FAQSection />
      <CTASection />
      <LandingFooter />

      {/* Floating Scroll to Top Button */}
      {scrolled && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-card/90 dark:bg-slate-900/90 text-foreground border border-border shadow-xl backdrop-blur-md hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer animate-in fade-in-50 zoom-in-90"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-primary" />
        </button>
      )}
    </main>
  );
}
