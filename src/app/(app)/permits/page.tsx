"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FireExtinguisher, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/table-skeleton";

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

export default function PermitsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["permits"],
    queryFn: () => api<PermitRow[]>("/permits"),
  });

  const filtered = useMemo(() => {
    const q2 = q.trim().toLowerCase();
    return (data ?? []).filter((p) =>
      !q2 || p.title.toLowerCase().includes(q2) || p.reference.toLowerCase().includes(q2),
    );
  }, [data, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Permits to work"
        description="Hot work, confined space, LOTO, working at height — with multi-level approvals."
        icon={FireExtinguisher}
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
            <TableSkeleton columns={6} rows={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              className="m-4 border-0 bg-transparent"
              icon={FireExtinguisher}
              title={data?.length ? "No permits match your search" : "No permits yet"}
              description={data?.length ? "Try a different search term." : "Permits-to-work will appear here once requested."}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{p.reference}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{p.permit_type.replaceAll("_", " ")}</TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-muted-foreground">{p.location ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div>{formatDateTime(p.valid_from)}</div>
                      <div className="opacity-70">→ {formatDateTime(p.valid_to)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[p.status] ?? "secondary"} className="capitalize">
                        {p.status.replaceAll("_", " ")}
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
