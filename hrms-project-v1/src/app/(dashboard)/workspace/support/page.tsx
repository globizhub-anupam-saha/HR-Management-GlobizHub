"use client";

import { ExternalLink, HelpCircle, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  return <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
    <div><h1 className="text-3xl font-bold text-foreground">Help & Support</h1><p className="mt-1 text-muted-foreground">Get help with your account, access, or day-to-day HR tasks.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border-border bg-card"><CardHeader><Mail className="mb-2 size-5 text-primary" /><CardTitle>Contact HR</CardTitle><CardDescription>For leave, payroll, policy, or document questions.</CardDescription></CardHeader><CardContent><a className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="mailto:hr@company.com?subject=GlobizHR%20support%20request">Email HR <ExternalLink className="size-4" /></a></CardContent></Card>
      <Card className="border-border bg-card"><CardHeader><ShieldCheck className="mb-2 size-5 text-primary" /><CardTitle>Account & security</CardTitle><CardDescription>Review active sessions, update your password, and manage notifications.</CardDescription></CardHeader><CardContent><a className="inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href="/workspace/profile#sessions">Open security settings <HelpCircle className="size-4" /></a></CardContent></Card>
    </div>
    <Card className="border-border bg-muted/30"><CardContent className="p-6 text-sm text-muted-foreground">Include a screenshot, the page you were using, and the approximate time the issue occurred when contacting support.</CardContent></Card>
  </div>;
}
