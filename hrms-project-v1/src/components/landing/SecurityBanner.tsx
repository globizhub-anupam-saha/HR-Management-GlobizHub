"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { ShieldCheck, ClipboardList, FolderLock } from "lucide-react";

export default function SecurityBanner() {
  return (
    <section id="security" className="py-20 bg-card border-y border-border/80">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal animation="fade-up">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left items-center">
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <div className="p-3 bg-primary/20 text-slate-900 dark:text-primary rounded-2xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Role-Based Access Control</h4>
                <p className="text-sm text-muted-foreground">Admin, HR Manager, and Staff permission guards.</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                <ClipboardList className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Immutable Audit Logs</h4>
                <p className="text-sm text-muted-foreground">Full activity logs for administrative traceability.</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
                <FolderLock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Encrypted Document Vault</h4>
                <p className="text-sm text-muted-foreground">Secure cloud storage for employee files &amp; IDs.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
