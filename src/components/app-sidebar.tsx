"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  ShieldAlert,
  FireExtinguisher,
  Beaker,
  GraduationCap,
  MapPin,
  FileText,
  AlertTriangle,
  CheckSquare,
  Settings,
  Smartphone,
  Activity,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  href: Route;
  icon: LucideIcon;
  label: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Operations",
    items: [
      { href: "/audits", icon: ClipboardCheck, label: "Audits" },
      { href: "/templates", icon: FileText, label: "Templates" },
      { href: "/permits", icon: FireExtinguisher, label: "Permits" },
      { href: "/incidents", icon: AlertTriangle, label: "Incidents" },
      { href: "/capas", icon: CheckSquare, label: "CAPA" },
    ],
  },
  {
    label: "Register",
    items: [
      { href: "/risks", icon: ShieldAlert, label: "Risks" },
      { href: "/chemicals", icon: Beaker, label: "Chemicals" },
      { href: "/zones", icon: MapPin, label: "Zones" },
      { href: "/training", icon: GraduationCap, label: "Training" },
    ],
  },
];

const footerItems: NavItem[] = [
  { href: "/m", icon: Smartphone, label: "Mobile app" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-card md:flex">
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-3 border-b px-5"
      >
        <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-6 text-primary-foreground shadow-glow">
          <Activity className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 grid h-3 w-3 place-items-center rounded-full bg-background">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight tracking-tight">SafeOps360</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            QHSE platform
          </span>
        </div>
      </Link>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        active
                          ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 w-[3px] rounded-r-full bg-gradient-to-b from-primary to-chart-6" />
                      )}
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-transform",
                          active ? "text-primary" : "group-hover:scale-110",
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant="info" className="h-5 px-1.5 text-[10px]">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-3 space-y-0.5">
        {footerItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-3 rounded-xl border bg-gradient-to-br from-primary/5 via-chart-6/5 to-transparent p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">AI Insights</span>
            <Badge variant="info" className="ml-auto h-5 px-1.5 text-[10px]">
              Beta
            </Badge>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Predictive hazard & compliance signals — coming soon.
          </p>
        </div>
      </div>
    </aside>
  );
}
