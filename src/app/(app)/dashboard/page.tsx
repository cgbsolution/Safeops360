"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckSquare,
  ClipboardCheck,
  FireExtinguisher,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { KpiCard } from "@/components/kpi-card";
import { KpiGridSkeleton } from "@/components/table-skeleton";
import { ModernBarChart, ModernPieChart, SEVERITY_COLORS } from "@/components/charts";
import { StatusDot } from "@/components/status-dot";
import { EmptyState } from "@/components/empty-state";

interface Bucket {
  label: string;
  count: number;
}
interface DashboardResponse {
  kpis: {
    open_audits: number;
    open_permits: number;
    open_incidents: number;
    open_capas: number;
    overdue_capas: number;
    lti_last_12m: number;
    trir: number;
    ltifr: number;
  };
  incident_by_type: Bucket[];
  findings_by_severity: Bucket[];
  permit_by_type: Bucket[];
}

function SafetyScoreCard({ kpis }: { kpis: DashboardResponse["kpis"] }) {
  // Rough composite: fewer overdue + fewer open incidents = higher score.
  const openPenalty = Math.min(kpis.open_incidents * 6, 40);
  const overduePenalty = Math.min(kpis.overdue_capas * 5, 30);
  const ltiPenalty = Math.min(kpis.lti_last_12m * 4, 20);
  const score = Math.max(0, 100 - openPenalty - overduePenalty - ltiPenalty);

  const tone =
    score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600";
  const ring =
    score >= 80
      ? "from-emerald-500/30 to-emerald-500/0"
      : score >= 60
      ? "from-amber-500/30 to-amber-500/0"
      : "from-red-500/30 to-red-500/0";

  return (
    <Card className="gradient-border relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${ring} opacity-60`} />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">Safety score</CardTitle>
          <CardDescription className="text-xs">Composite index from open incidents, overdue CAPAs & LTIs</CardDescription>
        </div>
        <Sparkles className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex items-end gap-2">
          <span className={`text-5xl font-semibold leading-none tabular-nums ${tone}`}>{score}</span>
          <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
          <Badge variant={score >= 80 ? "success" : score >= 60 ? "warning" : "critical"} className="ml-auto">
            {score >= 80 ? "Healthy" : score >= 60 ? "Watch" : "Action needed"}
          </Badge>
        </div>
        <Progress value={score} indicatorClassName={score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"} />
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border bg-background/60 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Incidents</div>
            <div className="mt-0.5 font-semibold tabular-nums">{kpis.open_incidents}</div>
          </div>
          <div className="rounded-lg border bg-background/60 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Overdue</div>
            <div className="mt-0.5 font-semibold tabular-nums">{kpis.overdue_capas}</div>
          </div>
          <div className="rounded-lg border bg-background/60 p-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">LTIs 12m</div>
            <div className="mt-0.5 font-semibold tabular-nums">{kpis.lti_last_12m}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WelcomeBanner({ name }: { name?: string | null }) {
  // Compute time-sensitive values after mount only — server and client wall-clocks
  // can disagree (timezone, locale), which would cause hydration mismatches.
  const [greeting, setGreeting] = useState("Welcome back");
  const [today, setToday] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
    setToday(
      new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    );
  }, []);

  const first = name?.split(" ")[0] ?? "there";
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-chart-6/5 to-transparent p-6 md:p-7">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-chart-6/10 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
            <StatusDot tone="success" /> Live operations
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-[28px]" suppressHydrationWarning>
            {greeting}, {first}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Here's a live picture of audits, permits, incidents and CAPAs across every site.
          </p>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Today</div>
            <div className="font-mono text-sm" suppressHydrationWarning>
              {today || "—"}
            </div>
          </div>
          <Separator orientation="vertical" className="h-10" />
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-6 text-primary-foreground shadow-glow">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <KpiGridSkeleton count={7} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-1" />
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuth((s) => s.user);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardResponse>("/dashboard"),
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Unable to load dashboard"
        description="We couldn't reach the analytics service. Try again in a moment."
        action={
          <button
            className="text-xs font-semibold text-primary hover:underline"
            onClick={() => refetch()}
          >
            Retry
          </button>
        }
      />
    );
  }

  const { kpis } = data;

  return (
    <div className="space-y-8">
      <WelcomeBanner name={user?.full_name} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Open audits"
          value={kpis.open_audits}
          icon={ClipboardCheck}
          hint="Across all sites"
          tone="default"
        />
        <KpiCard
          label="Active permits"
          value={kpis.open_permits}
          icon={FireExtinguisher}
          hint="Hot work, confined space…"
          tone="warning"
        />
        <KpiCard
          label="Open incidents"
          value={kpis.open_incidents}
          icon={AlertTriangle}
          hint="Includes near misses"
          tone="critical"
        />
        <KpiCard
          label="Overdue CAPAs"
          value={kpis.overdue_capas}
          hint={`of ${kpis.open_capas} open`}
          icon={CheckSquare}
          tone={kpis.overdue_capas > 0 ? "critical" : "success"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="LTI (last 12 months)"
          value={kpis.lti_last_12m}
          hint="Lost-time injuries"
          icon={ShieldAlert}
          tone="violet"
        />
        <KpiCard
          label="TRIR"
          value={kpis.trir.toFixed(2)}
          hint="Total recordable rate · per 200k hrs"
          icon={TrendingDown}
          tone="default"
        />
        <KpiCard
          label="LTIFR"
          value={kpis.ltifr.toFixed(2)}
          hint="Lost-time frequency · per 1M hrs"
          icon={TrendingUp}
          tone="default"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SafetyScoreCard kpis={kpis} />

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Findings by severity</CardTitle>
              <CardDescription>Distribution of audit findings — last period</CardDescription>
            </div>
            <Badge variant="secondary">{data.findings_by_severity.reduce((a, b) => a + b.count, 0)} total</Badge>
          </CardHeader>
          <CardContent>
            {data.findings_by_severity.length === 0 ? (
              <EmptyState icon={ClipboardCheck} title="No findings yet" description="Findings from published audits will appear here." />
            ) : (
              <ModernPieChart data={data.findings_by_severity} colorMap={SEVERITY_COLORS} height={280} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Incidents by type</CardTitle>
              <CardDescription>Volume by incident classification</CardDescription>
            </div>
            <Badge variant="warning">{data.incident_by_type.reduce((a, b) => a + b.count, 0)} recorded</Badge>
          </CardHeader>
          <CardContent>
            {data.incident_by_type.length === 0 ? (
              <EmptyState icon={AlertTriangle} title="No incidents" description="You're all clear — keep it that way." />
            ) : (
              <ModernBarChart data={data.incident_by_type} color="hsl(var(--chart-5))" height={280} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Permit volume by type</CardTitle>
              <CardDescription>Active / recently-issued permits to work</CardDescription>
            </div>
            <Badge variant="info">{data.permit_by_type.reduce((a, b) => a + b.count, 0)} permits</Badge>
          </CardHeader>
          <CardContent>
            {data.permit_by_type.length === 0 ? (
              <EmptyState icon={FireExtinguisher} title="No permits issued" description="New permits will be tracked here as they are requested." />
            ) : (
              <ModernBarChart data={data.permit_by_type} color="hsl(var(--chart-2))" height={280} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
