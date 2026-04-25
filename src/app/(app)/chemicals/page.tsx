"use client";

import { useQuery } from "@tanstack/react-query";
import { Beaker, ExternalLink, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { CardGridSkeleton } from "@/components/table-skeleton";

interface ChemicalRow {
  id: string;
  name: string;
  common_name: string | null;
  cas_number: string | null;
  manufacturer: string | null;
  signal_word: string | null;
  storage_location: string | null;
  quantity_on_hand: number | null;
  unit_of_measure: string | null;
  sds_url: string | null;
  sds_version: string | null;
  sds_expiry_date: string | null;
  ghs_pictograms: string[] | null;
}

const signalVariant: Record<string, "critical" | "warning" | "info"> = {
  Danger: "critical",
  Warning: "warning",
};

export default function ChemicalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["chemicals"],
    queryFn: () => api<ChemicalRow[]>("/chemicals"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Register"
        title="Chemical register & SDS"
        description="GHS pictograms, hazard statements, storage and SDS revisions."
        icon={Beaker}
      />

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={Beaker}
          title="No chemicals registered"
          description="Add chemicals to track hazards, storage and SDS expiry."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((c) => (
            <Card key={c.id} className="group relative overflow-hidden transition-all hover:shadow-glow">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 opacity-70" />
              <CardHeader className="space-y-2 pb-3 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{c.name}</CardTitle>
                    <CardDescription>{c.cas_number ? `CAS ${c.cas_number}` : "—"}</CardDescription>
                  </div>
                  {c.signal_word && (
                    <Badge variant={signalVariant[c.signal_word] ?? "warning"}>{c.signal_word}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{c.manufacturer ?? "Unknown mfr."}</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Package className="h-3.5 w-3.5" />
                    {c.quantity_on_hand ?? 0} {c.unit_of_measure ?? ""}
                  </span>
                </div>
                <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Storage
                  </div>
                  <div className="mt-0.5">{c.storage_location ?? "—"}</div>
                </div>
                {c.ghs_pictograms && c.ghs_pictograms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.ghs_pictograms.map((p) => (
                      <Badge key={p} variant="warning" className="capitalize">
                        {p}
                      </Badge>
                    ))}
                  </div>
                )}
                {c.sds_url && (
                  <a
                    href={c.sds_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    SDS {c.sds_version ?? ""} · expires {formatDate(c.sds_expiry_date)}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
