"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PlatformBillingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/platform-admin/billing/invoices");
  }, [router]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-xs">Redirecting to Billing Invoices...</p>
    </div>
  );
}
