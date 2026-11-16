"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePlatformAuth } from "@/context/PlatformAuthContext";
import {
  Menu,
  ExternalLink,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PlatformSidebar } from "./PlatformSidebar";

export function PlatformHeader() {
  const { user, logout } = usePlatformAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer whenever the pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="h-16 flex items-center justify-between px-3 sm:px-6 bg-card border-b border-border text-foreground flex-shrink-0 z-20 transition-all">
      {/* Left: Hamburger button for small screens & Environment breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Drawer Trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger
            className="lg:hidden inline-flex items-center justify-center size-9 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
            aria-label="Open Platform Navigation Menu"
          >
            <Menu className="size-4.5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-[272px] data-[side=left]:w-[272px] data-[side=left]:sm:max-w-[272px] border-r border-border bg-card overflow-hidden"
          >
            <PlatformSidebar
              className="flex h-full w-[272px] border-0"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-status-green animate-pulse" />
          <span className="text-xs font-bold tracking-wide text-foreground uppercase truncate">
            Platform Production
          </span>
        </div>
        <span className="hidden md:inline text-muted-foreground/40">/</span>
        <span className="hidden md:inline text-xs text-muted-foreground font-medium">SaaS Operations</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Switch to Organization HRMS preview */}
        <Link
          href="/workspace/dashboard"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors shadow-xs"
        >
          <span>Open Tenant Workspace</span>
          <ExternalLink className="size-3.5 text-slate-300" />
        </Link>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-muted/60 border border-border">
          <User className="size-3.5 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground max-w-[130px] sm:max-w-[200px] truncate">
            {user?.email || "superadmin@globizhr.com"}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign out of Platform Admin"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}
