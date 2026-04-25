"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Beaker,
  CheckSquare,
  ClipboardCheck,
  FireExtinguisher,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import { listQueued, removeQueued, type QueuedAudit } from "@/lib/offline-queue";
import { api, getToken } from "@/lib/api";
import { toast } from "@/lib/use-toast";

interface Tile {
  href: string;
  icon: typeof ClipboardCheck;
  label: string;
  description: string;
  tone: "primary" | "warning" | "critical" | "info" | "violet" | "emerald";
}

const tiles: Tile[] = [
  {
    href: "/m/audit/new",
    icon: ClipboardCheck,
    label: "Start audit",
    description: "Offline-capable capture",
    tone: "primary",
  },
  {
    href: "/m/incident/new",
    icon: AlertTriangle,
    label: "Report incident",
    description: "Near-misses & injuries",
    tone: "critical",
  },
  {
    href: "/m/permit",
    icon: FireExtinguisher,
    label: "Permits",
    description: "Hot work, confined space",
    tone: "warning",
  },
  {
    href: "/m/zones",
    icon: MapPin,
    label: "Zone check-in",
    description: "Classified areas",
    tone: "info",
  },
  {
    href: "/m/capas",
    icon: CheckSquare,
    label: "My CAPAs",
    description: "Actions assigned to you",
    tone: "emerald",
  },
  {
    href: "/m/chemicals",
    icon: Beaker,
    label: "SDS lookup",
    description: "Chemicals & hazards",
    tone: "violet",
  },
];

const toneClasses: Record<Tile["tone"], { bg: string; icon: string; ring: string }> = {
  primary: {
    bg: "from-primary/15 to-primary/5",
    icon: "text-primary",
    ring: "ring-primary/10",
  },
  warning: {
    bg: "from-amber-500/15 to-amber-500/5",
    icon: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/10",
  },
  critical: {
    bg: "from-red-500/15 to-red-500/5",
    icon: "text-red-600 dark:text-red-400",
    ring: "ring-red-500/10",
  },
  info: {
    bg: "from-sky-500/15 to-sky-500/5",
    icon: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/10",
  },
  violet: {
    bg: "from-violet-500/15 to-violet-500/5",
    icon: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/10",
  },
  emerald: {
    bg: "from-emerald-500/15 to-emerald-500/5",
    icon: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/10",
  },
};

export default function MobileHome() {
  const [mounted, setMounted] = useState(false);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState<QueuedAudit[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOnline(navigator.onLine);
    const handle = () => setOnline(navigator.onLine);
    window.addEventListener("online", handle);
    window.addEventListener("offline", handle);
    return () => {
      window.removeEventListener("online", handle);
      window.removeEventListener("offline", handle);
    };
  }, []);

  useEffect(() => {
    listQueued().then(setPending).catch(() => {});
  }, []);

  async function syncNow() {
    if (!online || !getToken()) {
      toast({
        title: "Can't sync",
        description: !online ? "You're offline." : "Please sign in first on the web app.",
        variant: "warning",
      });
      return;
    }
    setSyncing(true);
    try {
      for (const entry of pending) {
        await api("/audits", {
          method: "POST",
          body: JSON.stringify({
            title: entry.title,
            audit_type: entry.audit_type,
            offline_sync_id: entry.id,
          }),
        });
        await removeQueued(entry.id);
      }
      const remaining = await listQueued();
      setPending(remaining);
      toast({
        title: "Sync complete",
        description: `${pending.length} item(s) uploaded.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Sync failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="relative min-h-screen pb-24">
      {/* Top gradient band */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-chart-6/5 px-4 pb-10 pt-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-chart-6/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-md items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-6 text-primary-foreground shadow-glow">
              <Activity className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 grid h-3 w-3 place-items-center rounded-full bg-background">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="text-base font-semibold leading-tight tracking-tight">SafeOps360</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Field companion
              </div>
            </div>
          </Link>

          {mounted ? (
            online ? (
              <Badge variant="success" className="gap-1.5">
                <Wifi className="h-3 w-3" /> Online
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1.5">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            )
          ) : (
            <Badge variant="neutral" className="gap-1.5">
              <Wifi className="h-3 w-3" /> …
            </Badge>
          )}
        </div>

        <div className="relative mx-auto mt-6 max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight">Good shift.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture audits, report incidents, check into zones — works offline.
          </p>
        </div>
      </div>

      {/* Action tiles */}
      <div className="mx-auto -mt-4 max-w-md px-4">
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((tile) => {
            const tone = toneClasses[tile.tone];
            return (
              <Link key={tile.href} href={tile.href as never}>
                <Card className={`group h-full transition-all active:scale-[0.98] hover:shadow-glow`}>
                  <CardContent className="flex h-full flex-col gap-3 p-4">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${tone.bg} ${tone.icon} ring-1 ring-inset ${tone.ring}`}
                    >
                      <tile.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold leading-tight">{tile.label}</div>
                      <div className="text-[11px] text-muted-foreground">{tile.description}</div>
                    </div>
                    <ArrowRight className="ml-auto mt-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Offline queue */}
      <div className="mx-auto mt-6 max-w-md px-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Offline queue</div>
            <div className="text-[11px] text-muted-foreground">
              Items captured while offline — sync when you get a connection.
            </div>
          </div>
          {pending.length > 0 && (
            <Badge variant="warning">{pending.length} pending</Badge>
          )}
        </div>

        <Card>
          <CardContent className="p-3">
            {pending.length === 0 ? (
              <EmptyState
                className="border-0 bg-transparent py-6"
                icon={CheckSquare}
                title="All caught up"
                description="Nothing pending to sync."
              />
            ) : (
              <>
                <div className="space-y-2">
                  {pending.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <ClipboardCheck className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p.title}</div>
                        <div className="text-[11px] text-muted-foreground" suppressHydrationWarning>
                          {mounted ? new Date(p.created_at).toLocaleString() : ""}
                        </div>
                      </div>
                      <Badge variant="neutral" className="shrink-0 capitalize">
                        {p.audit_type.replaceAll("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <Button
                  variant="gradient"
                  className="w-full"
                  disabled={!online || syncing}
                  onClick={syncNow}
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing…" : "Sync now"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mx-auto mt-6 max-w-md px-4">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          Open web console
        </Link>
      </div>

      <div className="mx-auto mt-5 max-w-md px-4 text-center text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <GraduationCap className="h-3 w-3" />
          Training & competency on the web dashboard
        </span>
      </div>
    </div>
  );
}
