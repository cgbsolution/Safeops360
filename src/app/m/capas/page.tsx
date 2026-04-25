"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CheckSquare, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { MobileTopbar } from "@/components/mobile-topbar";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface CapaRow {
  id: string;
  reference: string;
  title: string;
  source_type: string;
  status: string;
  due_date: string | null;
}

const statusVariant: Record<string, "info" | "warning" | "success" | "critical" | "secondary"> = {
  open: "warning",
  in_progress: "info",
  verification: "info",
  closed: "success",
  rejected: "critical",
};

export default function MobileCapasPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"open" | "in_progress" | "all" | "closed">("open");

  const { data, isLoading } = useQuery({
    queryKey: ["capas"],
    queryFn: () => api<CapaRow[]>("/capas"),
  });

  const filtered = useMemo(() => {
    const q2 = q.trim().toLowerCase();
    return (data ?? []).filter((c) => {
      const matchFilter = filter === "all" || c.status === filter;
      const matchQ =
        !q2 || c.title.toLowerCase().includes(q2) || c.reference.toLowerCase().includes(q2);
      return matchFilter && matchQ;
    });
  }, [data, q, filter]);

  const overdue = (c: CapaRow) =>
    c.due_date && new Date(c.due_date) < new Date() && c.status !== "closed";

  return (
    <>
      <MobileTopbar title="My CAPAs" subtitle="Corrective & preventive actions" backHref="/m" />

      <div className="mx-auto max-w-md space-y-4 px-4 pb-24 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1.5">
          {(["open", "in_progress", "closed", "all"] as const).map((f) => (
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
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Nothing here"
            description={data?.length ? "No CAPAs match this filter." : "No CAPAs assigned yet."}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <Card key={c.id} className="transition-all active:scale-[0.99]">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.reference}
                      </div>
                      <div className="text-sm font-semibold">{c.title}</div>
                    </div>
                    <Badge variant={statusVariant[c.status] ?? "secondary"} className="shrink-0 capitalize">
                      {c.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="capitalize">Source: {c.source_type}</span>
                    {c.due_date && (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          overdue(c) ? "font-semibold text-red-600 dark:text-red-400" : ""
                        }`}
                      >
                        <CalendarClock className="h-3 w-3" />
                        Due {formatDate(c.due_date)}
                        {overdue(c) && <Badge variant="critical" className="ml-1">Overdue</Badge>}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
