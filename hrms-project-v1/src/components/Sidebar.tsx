"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Settings,
  Clock,
  Calendar,
  Briefcase,
  CheckSquare,
  FolderOpen,
  HelpCircle,
  CalendarCheck,
  CalendarIcon,
  Banknote,
  Calculator,
  Shield,
  UserCheck,
  LogOut,
  GraduationCap,
  Sparkles,
  Network,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { useViewMode } from "@/context/ViewModeContext";
import { usePermissions } from "@/context/PermissionContext";
import { cn } from "@/lib/utils";
import Logo from "@/components/brand/Logo";

interface NavItem {
  key: string;
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({
  role,
  className,
}: {
  role?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const { user, isViewAsUser } = useViewMode();
  const { sidebarModuleKeys, designation, canAccessModule } = usePermissions();

  const isManagerMode = user?.role === "MANAGER" && !isViewAsUser;
  const isSimulatedUser = user?.role === "MANAGER" && isViewAsUser;
  const isAdminOrHR =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "OWNER" ||
    user?.role === "HR_HEAD";

  // Navigation structure based on requested layout
  const sections: NavSection[] = [
    {
      title: "Workspace",
      items: [
        {
          key: "dashboard",
          name: "Dashboard",
          href: "/workspace/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Talent Management",
      items: [
        {
          key: "onboarding",
          name: "Onboarding",
          href: "/workspace/onboarding",
          icon: UserCheck,
        },
        {
          key: "recruitment",
          name: "Recruitment",
          href: "/workspace/recruitment",
          icon: Briefcase,
        },
        {
          key: "training",
          name: "Training & Development",
          href: "/workspace/training",
          icon: GraduationCap,
          adminOnly: true,
        },
      ],
    },
    {
      title: "Employee Management",
      items: [
        {
          key: "employees",
          name: "Employees",
          href: "/workspace/employees",
          icon: Users,
        },
        {
          key: "org_chart",
          name: "Org Chart",
          href: "/workspace/employees/org-chart",
          icon: Network,
        },
        {
          key: "designations",
          name: "Designations",
          href: "/workspace/settings/designations",
          icon: Shield,
        },
        {
          key: "resignation",
          name: "Resignations",
          href: "/workspace/resignation",
          icon: LogOut,
        },
      ],
    },
    {
      title: "Attendance & Leave",
      items: [
        {
          key: "attendance",
          name: "Clock ins/outs",
          href: "/workspace/attendance",
          icon: Clock,
        },
        // For Admin/Manager: Leave Approvals; For Employee: Leave
        isAdminOrHR || isManagerMode
          ? {
              key: "leave_approvals",
              name: "Leave Approvals",
              href: "/workspace/leave/admin",
              icon: CalendarCheck,
            }
          : {
              key: "leave",
              name: "Leave",
              href: "/workspace/leave",
              icon: CalendarClock,
            },
        {
          key: "leave_policies",
          name: "Leave Policies",
          href: "/workspace/leave/admin/settings",
          icon: CalendarClock,
          adminOnly: true,
        },
        // For Admin: Manage Schedules; For Employee: Schedules / Shifts
        isAdminOrHR || isManagerMode
          ? {
              key: "manage_schedules",
              name: "Manage Schedules",
              href: "/workspace/schedules/admin",
              icon: CalendarIcon,
            }
          : {
              key: "schedules",
              name: "My Schedules",
              href: "/workspace/schedules",
              icon: Calendar,
            },
      ],
    },
    {
      title: "Administration",
      items: [
        // For Admin: Payroll Processing; For Employee: My Payslips
        isAdminOrHR
          ? {
              key: "payroll",
              name: "Payroll Processing",
              href: "/workspace/payroll/admin",
              icon: Calculator,
            }
          : {
              key: "payslips",
              name: "My Payslips",
              href: "/workspace/my-payslips",
              icon: Banknote,
            },
        // For Admin: Documents (Admin); For Employee: Documents
        isAdminOrHR
          ? {
              key: "documents_admin",
              name: "Documents (Admin)",
              href: "/workspace/documents/admin",
              icon: FolderOpen,
            }
          : {
              key: "documents",
              name: "Documents",
              href: "/workspace/documents",
              icon: FolderOpen,
            },
        {
          key: "tasks",
          name: "Tasks",
          href: "/workspace/tasks",
          icon: CheckSquare,
        },
        {
          key: "billing",
          name: "Subscription & Billing",
          href: "/workspace/settings/billing",
          icon: CreditCard,
          adminOnly: true,
        },
        {
          key: "settings",
          name: "Settings",
          href: "/workspace/settings",
          icon: Settings,
        },
      ],
    },
  ];

  // Helper to test if a user has access to a nav item
  const isItemVisible = (item: NavItem): boolean => {
    if (item.adminOnly && !isAdminOrHR) return false;

    // Designations is accessible for Admins and HR
    if (item.key === "designations") {
      return isAdminOrHR || sidebarModuleKeys.includes("designations");
    }

    // Direct access check via permissions
    if (item.key === "billing") {
      return isAdminOrHR;
    }
    if (sidebarModuleKeys.includes(item.key)) return true;

    // Admin has access to standard modules
    if (isAdminOrHR) {
      const adminKeys = [
        "dashboard",
        "onboarding",
        "recruitment",
        "training",
        "employees",
        "designations",
        "resignation",
        "attendance",
        "leave_approvals",
        "leave_policies",
        "manage_schedules",
        "payroll",
        "documents_admin",
        "tasks",
        "settings",
      ];
      return adminKeys.includes(item.key);
    }

    return canAccessModule?.(item.key) ?? false;
  };

  // Filter sections and items based on permissions
  const filteredSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(isItemVisible),
    }))
    .filter((section) => section.items.length > 0);

  // Collect all visible links for active URL calculation
  const allVisibleItems = filteredSections.flatMap((s) => s.items);

  // Longest-prefix match for active link
  const activeHref = allVisibleItems
    .filter(
      (link) => pathname === link.href || pathname.startsWith(`${link.href}/`)
    )
    .sort(
      (firstLink, secondLink) => secondLink.href.length - firstLink.href.length
    )[0]?.href;

  return (
    <aside
      className={cn(
        "w-[264px] shrink-0 flex flex-col justify-between border-r border-hairline border-separator material-translucent select-none bg-sidebar/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-16 flex flex-col justify-center px-4 border-b border-hairline border-separator shrink-0">
          <div className="flex items-center justify-between">
            <Link href="/workspace/dashboard" className="flex items-center gap-2.5">
              <Logo variant="text-lockup" size="sm" />
            </Link>

            {/* Role Badge */}
            {isManagerMode && (
              <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                Manager
              </span>
            )}
            {isSimulatedUser && (
              <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                User
              </span>
            )}
            {isAdminOrHR && !isManagerMode && !isSimulatedUser && (
              <span className="text-[10px] font-semibold bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                Admin
              </span>
            )}
            {!isAdminOrHR && !isManagerMode && !isSimulatedUser && (
              <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                Employee
              </span>
            )}
          </div>

          {designation && !isSimulatedUser && (
            <span
              className="mt-1 self-start text-[10px] font-medium px-2 py-0.5 rounded-full border border-hairline"
              style={{
                backgroundColor: `${designation.color}15`,
                borderColor: `${designation.color}40`,
                color: designation.color,
              }}
            >
              {designation.name}
            </span>
          )}
        </div>

        {/* Grouped Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {/* Section Header */}
              <div className="px-2.5 pb-1 pt-1 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-[0.06em]">
                {section.title}
              </div>

              {/* Section Links */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === activeHref;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center min-h-[36px] px-2.5 py-1.5 rounded-[10px] text-[13.5px] tracking-tight transition-all duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]",
                        isActive
                          ? "bg-primary/12 text-primary font-semibold shadow-xs dark:bg-primary/20"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-primary" />
                      )}

                      <Icon
                        className={cn(
                          "size-[18px] mr-2.5 shrink-0 transition-colors",
                          isActive
                            ? "text-primary stroke-[2.2]"
                            : "text-muted-foreground group-hover:text-foreground stroke-[1.6]"
                        )}
                      />

                      <span className="truncate">{item.name}</span>

                      {item.badge && (
                        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Support Link */}
      <div className="p-3 border-t border-hairline border-separator shrink-0 material-translucent">
        <Link
          href="/workspace/support"
          className="flex items-center w-full min-h-[36px] px-2.5 py-1.5 text-[13.5px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground rounded-[10px] transition-all duration-150 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <HelpCircle className="size-[18px] mr-2.5 text-muted-foreground stroke-[1.6]" />
          <span>Help & Support</span>
        </Link>
      </div>
    </aside>
  );
}
