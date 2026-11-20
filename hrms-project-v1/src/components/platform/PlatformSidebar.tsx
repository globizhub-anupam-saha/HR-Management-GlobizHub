"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Activity,
  Building2,
  UserPlus,
  Clock,
  CheckCircle2,
  Ban,
  CreditCard,
  Repeat,
  History,
  Receipt,
  DollarSign,
  AlertOctagon,
  Boxes,
  SlidersHorizontal,
  Users2,
  ShieldCheck,
  ScrollText,
  LifeBuoy,
  Settings,
  ChevronDown,
  Sparkles,
  Search,
  X,
  ExternalLink,
  LogOut,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { usePlatformAuth } from "@/context/PlatformAuthContext";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";

interface PlatformNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "destructive";
  roles?: string[];
}

interface PlatformNavSection {
  index: string;
  title: string;
  items: PlatformNavItem[];
}

const SECTIONS: PlatformNavSection[] = [
  {
    index: "01",
    title: "Platform Overview",
    items: [
      { name: "Executive Dashboard", href: "/platform-admin/dashboard", icon: LayoutDashboard },
      { name: "Platform Analytics", href: "/platform-admin/analytics", icon: BarChart3, badge: "30D", badgeVariant: "default" },
      { name: "System Health", href: "/platform-admin/health", icon: Activity, badge: "Live", badgeVariant: "success" },
    ],
  },
  {
    index: "02",
    title: "Organization Management",
    items: [
      { name: "All Organizations", href: "/platform-admin/organizations", icon: Building2 },
      { name: "Onboard Organization", href: "/platform-admin/organizations/onboard", icon: UserPlus },
      { name: "Approvals Queue", href: "/platform-admin/organizations/approvals", icon: Clock },
      { name: "Active Tenants", href: "/platform-admin/organizations/active", icon: CheckCircle2 },
      { name: "Suspended Tenants", href: "/platform-admin/organizations/suspended", icon: Ban, badgeVariant: "destructive" },
    ],
  },
  {
    index: "03",
    title: "Subscription & Billing",
    items: [
      { name: "Subscription Plans", href: "/platform-admin/subscriptions/plans", icon: CreditCard },
      { name: "Active Subscriptions", href: "/platform-admin/subscriptions/active", icon: Repeat },
      { name: "Lifecycle History", href: "/platform-admin/subscriptions/history", icon: History },
      { name: "Invoices", href: "/platform-admin/billing/invoices", icon: Receipt },
      { name: "Payments Ledger", href: "/platform-admin/billing/payments", icon: DollarSign },
      { name: "Failed Payments", href: "/platform-admin/billing/failed", icon: AlertOctagon, badgeVariant: "warning" },
    ],
  },
  {
    index: "04",
    title: "Product & Modules",
    items: [
      { name: "HRMS Modules", href: "/platform-admin/modules", icon: Boxes },
      { name: "Plan Entitlements", href: "/platform-admin/modules/entitlements", icon: SlidersHorizontal },
    ],
  },
  {
    index: "05",
    title: "Platform Staff & Access",
    items: [
      { name: "Super Admins & Staff", href: "/platform-admin/users", icon: Users2 },
      { name: "Roles & Permissions", href: "/platform-admin/users/roles", icon: ShieldCheck },
    ],
  },
  {
    index: "06",
    title: "Security & Audit",
    items: [
      { name: "Audit Trail", href: "/platform-admin/monitoring/audit-logs", icon: ScrollText },
    ],
  },
  {
    index: "07",
    title: "Customer Support",
    items: [
      { name: "Support Tickets", href: "/platform-admin/support", icon: LifeBuoy },
    ],
  },
  {
    index: "08",
    title: "Platform Settings",
    items: [
      { name: "Platform Settings", href: "/platform-admin/settings", icon: Settings },
    ],
  },
];

export function PlatformSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = usePlatformAuth();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const query = searchQuery.toLowerCase().trim();

    return SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          section.title.toLowerCase().includes(query)
      ),
    })).filter((section) => section.items.length > 0);
  }, [searchQuery]);

  const getBadgeClass = (variant?: "default" | "success" | "warning" | "destructive") => {
    switch (variant) {
      case "success":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25";
      case "warning":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25";
      case "destructive":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25";
      default:
        return "bg-primary/15 text-primary border border-primary/25";
    }
  };

  return (
    <aside
      className={cn(
        "w-[272px] shrink-0 flex flex-col justify-between border-r border-border bg-card/95 backdrop-blur-md select-none z-30 transition-all",
        className
      )}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/80 shrink-0 bg-card">
          <Link href="/platform-admin/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-white dark:bg-slate-900 border border-border/80 flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Logo variant="emblem" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-foreground block leading-tight">
                  <span className="text-[#0066B2] dark:text-[#38BDF8]">Globiz</span><span className="text-[#F7941D]">Hr</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 uppercase tracking-wide">
                  Super Admin
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-mono">Platform v2.0 &bull; Online</span>
              </div>
            </div>
          </Link>

          {onNavigate && (
            <button
              type="button"
              onClick={onNavigate}
              aria-label="Close navigation menu"
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Quick Search Bar */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
            <input
              type="text"
              placeholder="Quick search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-7 text-xs rounded-lg bg-muted/50 border border-border/70 text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-background transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Nav List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3.5 scrollbar-thin scrollbar-thumb-muted-foreground/15 hover:scrollbar-thumb-muted-foreground/30">
          {filteredSections.map((section) => {
            const isCollapsed = !searchQuery && collapsedSections[section.title];
            const hasActiveChild = section.items.some(
              (i) => pathname === i.href || (i.href !== "/platform-admin/dashboard" && pathname.startsWith(i.href))
            );

            return (
              <div key={section.title} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10.5px] font-semibold text-muted-foreground/75 uppercase tracking-[0.06em] hover:text-foreground transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-medium">
                      {section.index}
                    </span>
                    <span className={cn(hasActiveChild && "text-foreground font-bold")}>
                      {section.title}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-3 text-muted-foreground/60 transition-transform duration-200 group-hover:text-foreground",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 pt-0.5">
                    {section.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/platform-admin/dashboard" && pathname.startsWith(item.href));

                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "group relative flex items-center min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs tracking-tight transition-all duration-150 active:scale-[0.98]",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold shadow-xs"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium"
                          )}
                        >
                          {/* Active Indicator Bar */}
                          {isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                          )}

                          <Icon
                            className={cn(
                              "size-4 mr-2.5 shrink-0 transition-colors",
                              isActive
                                ? "text-primary stroke-[2.2]"
                                : "text-muted-foreground group-hover:text-foreground stroke-[1.6]"
                            )}
                          />
                          <span className="truncate">{item.name}</span>

                          {item.badge && (
                            <span
                              className={cn(
                                "ml-auto text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full font-mono flex items-center gap-1",
                                getBadgeClass(item.badgeVariant)
                              )}
                            >
                              {item.badge === "Live" && (
                                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No navigation items match &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </nav>
      </div>

  

      {/* Admin User Footer with Quick Sign Out */}
      <div className="p-3 border-t border-border shrink-0 bg-card">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/30 transition-all">
          <Link
            href="/platform-admin/users"
            onClick={onNavigate}
            className="flex items-center gap-2.5 min-w-0 flex-1 group"
            title="Manage Super Admins & Platform Staff"
          >
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-foreground uppercase group-hover:scale-105 transition-transform shrink-0">
              {user?.firstName?.[0] || "S"}
              {user?.lastName?.[0] || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "Platform Super Admin"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="size-1 rounded-full bg-emerald-500" />
                <span className="text-[9.5px] text-primary font-mono font-medium truncate">
                  {user?.role || "SUPER_ADMIN"}
                </span>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={logout}
            title="Sign out of Platform Admin"
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
