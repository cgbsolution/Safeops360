"use client";

import { useQuery } from "@tanstack/react-query";
import { Briefcase, Factory, ListChecks, ScrollText, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { INDUSTRY_LABELS, type IndustryProfile } from "@/lib/industry";
import { PageHeader } from "@/components/page-header";

export default function IndustryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["industry-profile"],
    queryFn: () => api<IndustryProfile>("/organizations/me/industry-profile"),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Settings" title="Industry profile" description="Loading your sector configuration…" icon={Factory} />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Industry profile"
        description="How SafeOps360 is tuned for your sector."
        icon={Factory}
      />

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-chart-6/5 to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-6 text-primary-foreground shadow-glow">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">{INDUSTRY_LABELS[data.industry]}</CardTitle>
              <CardDescription>{data.tagline}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-warning/15 text-amber-600">
                <ScrollText className="h-4 w-4" />
              </div>
              <CardTitle>Primary permit types</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.primary_permits.map((p) => (
              <Badge key={p} variant="info" className="capitalize">
                {p.replaceAll("_", " ")}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground">
                <ListChecks className="h-4 w-4" />
              </div>
              <CardTitle>Applicable standards</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.standards.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <ListChecks className="h-4 w-4" />
              </div>
              <CardTitle>Recommended audit templates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.audit_templates.map((t) => (
              <div
                key={t}
                className="rounded-lg border bg-background/50 px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                {t}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-chart-6/10 text-violet-600">
                <Target className="h-4 w-4" />
              </div>
              <CardTitle>Core KPIs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.kpis.map((k) => (
              <Badge key={k} variant="violet" className="capitalize">
                {k}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
