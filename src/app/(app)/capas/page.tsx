"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckSquare, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/table-skeleton";

interface CapaRow {
  id: string;
  reference: string;
  title: string;
  source_type: string;
  status: string;
  due_date: string | null;
}

const statusVariant: Record<string, "info" | "warning" | "success" | "critical"> = {
  open: "warning",
  in_progress: "info",
  verification: "info",
  closed: "success",
  rejected: "critical",
};

export default function CapasPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["capas"],
    queryFn: () => api<CapaRow[]>("/capas"),
  });

  const filtered = useMemo(() => {
    const q2 = q.trim().toLowerCase();
    return (data ?? []).filter(
      (c) => !q2 || c.title.toLowerCase().includes(q2) || c.reference.toLowerCase().includes(q2),
    );
  }, [data, q]);

  const overdue = (c: CapaRow) => c.due_date && new Date(c.due_date) < new Date() && c.status !== "closed";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Corrective & preventive actions"
        description="Track actions sourced from audits, incidents, and inspections."
        icon={CheckSquare}
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search CAPAs by title or reference…"
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
            <TableSkeleton columns={5} rows={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              className="m-4 border-0 bg-transparent"
              icon={CheckSquare}
              title={data?.length ? "No matches" : "No CAPAs yet"}
              description={data?.length ? "Try a different search." : "CAPAs will appear here when actions are assigned."}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{c.reference}</TableCell>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{c.source_type}</TableCell>
                    <TableCell className={overdue(c) ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}>
                      {formatDate(c.due_date)}
                      {overdue(c) && <Badge variant="critical" className="ml-2">Overdue</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[c.status] ?? "secondary"} className="capitalize">
                        {c.status.replaceAll("_", " ")}
                      </Badge>
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
