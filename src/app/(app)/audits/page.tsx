"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Filter, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/table-skeleton";

interface AuditRow {
  id: string;
  reference: string;
  title: string;
  audit_type: string;
  status: string;
  progress_percent: number;
  scheduled_date: string | null;
  created_at: string;
}

const statusVariant: Record<string, "secondary" | "warning" | "info" | "success" | "critical"> = {
  draft: "secondary",
  in_progress: "warning",
  submitted: "info",
  reviewed: "info",
  closed: "success",
};

const STATUSES = ["all", "draft", "in_progress", "submitted", "reviewed", "closed"] as const;

export default function AuditsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["audits"],
    queryFn: () => api<AuditRow[]>("/audits"),
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      const matchStatus = status === "all" || row.status === status;
      const q2 = q.trim().toLowerCase();
      const matchQ = !q2 || row.title.toLowerCase().includes(q2) || row.reference.toLowerCase().includes(q2);
      return matchStatus && matchQ;
    });
  }, [data, q, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Audits & inspections"
        description="Digital audits with sections, scoring, findings and CAPA follow-through."
        icon={ClipboardCheck}
        actions={
          <Link href="/audits/new">
            <Button variant="gradient" size="lg">
              <Plus className="h-4 w-4" /> New audit
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by reference or title…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  status === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton columns={7} rows={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              className="m-4 border-0 bg-transparent"
              icon={ClipboardCheck}
              title={data?.length ? "No audits match your filters" : "No audits yet"}
              description={data?.length ? "Try clearing filters or searching by reference." : "Create your first audit to get started."}
              action={
                !data?.length && (
                  <Link href="/audits/new">
                    <Button variant="gradient"><Plus className="h-4 w-4" /> New audit</Button>
                  </Link>
                )
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40">Progress</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{row.reference}</TableCell>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{row.audit_type.replaceAll("_", " ")}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[row.status] ?? "secondary"} className="capitalize">
                        {row.status.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={row.progress_percent} className="h-1.5" />
                        <span className="text-xs tabular-nums text-muted-foreground">{row.progress_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(row.scheduled_date)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/audits/${row.id}`} className="text-sm font-medium text-primary hover:underline">
                        Open →
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
