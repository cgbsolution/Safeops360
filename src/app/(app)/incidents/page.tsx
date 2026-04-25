"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/table-skeleton";

interface IncidentRow {
  id: string;
  reference: string;
  incident_type: string;
  severity: string;
  status: string;
  title: string;
  occurred_at: string | null;
  lost_workdays: number;
}

const severityVariant: Record<string, "info" | "warning" | "critical" | "success"> = {
  low: "success",
  medium: "warning",
  high: "critical",
  critical: "critical",
};

export default function IncidentsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => api<IncidentRow[]>("/incidents"),
  });

  const filtered = useMemo(() => {
    const q2 = q.trim().toLowerCase();
    return (data ?? []).filter(
      (i) => !q2 || i.title.toLowerCase().includes(q2) || i.reference.toLowerCase().includes(q2),
    );
  }, [data, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Incidents & near misses"
        description="Report, investigate, and track corrective actions end-to-end."
        icon={AlertTriangle}
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or reference…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
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
              icon={AlertTriangle}
              title={data?.length ? "No matching incidents" : "No incidents recorded"}
              description={data?.length ? "Try a different search." : "Nothing to report — keep up the good work."}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Occurred</TableHead>
                  <TableHead className="text-right">Lost days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{i.reference}</TableCell>
                    <TableCell className="font-medium">{i.title}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{i.incident_type.replaceAll("_", " ")}</TableCell>
                    <TableCell>
                      <Badge variant={severityVariant[i.severity] ?? "info"} className="capitalize">
                        {i.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {i.status.replaceAll("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(i.occurred_at)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{i.lost_workdays}</TableCell>
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
