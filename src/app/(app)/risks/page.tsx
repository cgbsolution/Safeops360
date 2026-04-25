"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/table-skeleton";

interface RiskRow {
  id: string;
  reference: string;
  activity: string;
  hazard: string;
  inherent_score: number;
  inherent_level: string;
  residual_score: number;
  residual_level: string;
}

const levelVariant: Record<string, "success" | "info" | "warning" | "critical"> = {
  low: "success",
  medium: "warning",
  high: "critical",
  critical: "critical",
};

function ScoreCell({ score, level }: { score: number; level: string }) {
  const dotColor: Record<string, string> = {
    low: "bg-emerald-500",
    medium: "bg-amber-500",
    high: "bg-red-500",
    critical: "bg-red-600",
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dotColor[level] ?? "bg-muted-foreground"}`} />
      <span className="tabular-nums font-medium">{score}</span>
      <Badge variant={levelVariant[level] ?? "secondary"} className="capitalize">
        {level}
      </Badge>
    </div>
  );
}

export default function RisksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["risks"],
    queryFn: () => api<RiskRow[]>("/risks"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Register"
        title="Risk register (HIRA)"
        description="Likelihood × severity scoring with inherent and residual risk tracking."
        icon={ShieldAlert}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton columns={5} rows={6} />
          ) : (data ?? []).length === 0 ? (
            <EmptyState
              className="m-4 border-0 bg-transparent"
              icon={ShieldAlert}
              title="No risks logged"
              description="Add risks to your register to track controls and residual impact."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Hazard</TableHead>
                  <TableHead>Inherent</TableHead>
                  <TableHead>Residual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{r.reference}</TableCell>
                    <TableCell className="font-medium">{r.activity}</TableCell>
                    <TableCell className="text-muted-foreground">{r.hazard}</TableCell>
                    <TableCell><ScoreCell score={r.inherent_score} level={r.inherent_level} /></TableCell>
                    <TableCell><ScoreCell score={r.residual_score} level={r.residual_level} /></TableCell>
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
