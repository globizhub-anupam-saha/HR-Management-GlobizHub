"use client";

import { Mail, Edit3, Send, CheckCircle2 } from "lucide-react";

export default function EmailTemplatesPage() {
  const templates = [
    {
      name: "Tenant Welcome & Onboarding Activation",
      key: "TENANT_WELCOME",
      subject: "Welcome to GlobizHR — Complete Your Company Setup",
      category: "Lifecycle",
    },
    {
      name: "Invoice Issued & Payment Due",
      key: "INVOICE_ISSUED",
      subject: "New GlobizHR Invoice {{invoice_number}} Available",
      category: "Billing",
    },
    {
      name: "Payment Succeeded & Receipt",
      key: "PAYMENT_RECEIPT",
      subject: "Payment Received: Receipt for Invoice {{invoice_number}}",
      category: "Billing",
    },
    {
      name: "Payment Failed / Dunning Notice",
      key: "DUNNING_WARNING",
      subject: "Action Required: Subscription Payment Failed for {{company_name}}",
      category: "Dunning",
    },
    {
      name: "Trial Ending in 3 Days Reminder",
      key: "TRIAL_EXPIRING",
      subject: "Your GlobizHR 14-Day Free Trial Ends Soon",
      category: "Growth",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">System Email Templates</h1>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          MJML / HTML Templates
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Customizable transactional email templates dispatched to customer tenants for billing, onboarding, and alerts.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.key}
            className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between hover:border-primary/40 transition-colors shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background text-purple-400 border border-purple-500/20 uppercase font-semibold">
                  {tpl.category}
                </span>
                <code className="text-[10px] text-muted-foreground font-mono">{tpl.key}</code>
              </div>
              <h3 className="font-semibold text-foreground text-sm">{tpl.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 italic">"{tpl.subject}"</p>
            </div>

            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-status-green flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active & Compiled
              </span>
              <button
                onClick={() => alert(`Edit template: ${tpl.key}`)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-foreground font-medium"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Customize Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

