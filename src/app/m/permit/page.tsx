"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FireExtinguisher, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { MobileTopbar } from "@/components/mobile-topbar";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

interface PermitRow {
  id: string;
  reference: string;
  permit_type: string;
  title: string;
  location: string | null;
  status: string;
  valid_from: string | null;
  valid_to: string | null;
}

const statusVariant: Record<string, "info" | "warning" | "success" | "critical" | "secondary"> = {
  draft: "secondary",
  pending_approval: "warning",
  active: "success",
  expiring: "warning",
  closed: "secondary",
  suspended: "critical",
};

export default function MobilePermitsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending_approval">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["permits"],
    queryFn: () => api<PermitRow[]>("/permits"),
  });

  const filtered = useMemo(() => {
    const q2 = q.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      const matchFilter = filter === "all" || p.status === filter;
      const matchQ =
        !q2 || p.title.toLowerCase().includes(q2) || p.reference.toLowerCase().includes(q2);
      return matchFilter && matchQ;
    });
  }, [data, q, filter]);

  return (
    <>
      <MobileTopbar title="Permits to work" subtitle="Active & pending" backHref="/m" />

      <div className="mx-auto max-w-md space-y-4 px-4 pb-24 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title or reference…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1.5">
          {(["all", "active", "pending_approval"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FireExtinguisher}
            title="No permits"
            description={data?.length ? "Try clearing filters." : "You have no permits right now."}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <Card key={p.id} className="transition-all active:scale-[0.99]">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {p.reference}
                      </div>
                      <div className="truncate text-sm font-semibold">{p.title}</div>
                    </div>
                    <Badge variant={statusVariant[p.status] ?? "secondary"} className="capitalize">
                      {p.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <FireExtinguisher className="h-3 w-3" />
                      <span className="capitalize">{p.permit_type.replaceAll("_", " ")}</span>
                    </span>
                    {p.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {p.location}
                      </span>
                    )}
                  </div>
                  {(p.valid_from || p.valid_to) && (
                    <div className="rounded-lg border bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                      <span className="font-medium">Valid:</span> {formatDateTime(p.valid_from)} → {formatDateTime(p.valid_to)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
