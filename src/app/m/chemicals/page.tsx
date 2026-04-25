"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Beaker, ExternalLink, Package, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { MobileTopbar } from "@/components/mobile-topbar";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

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

export default function MobileChemicalsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["chemicals"],
    queryFn: () => api<ChemicalRow[]>("/chemicals"),
  });

  const filtered = useMemo(() => {
    const q2 = q.trim().toLowerCase();
    return (data ?? []).filter(
      (c) =>
        !q2 ||
        c.name.toLowerCase().includes(q2) ||
        c.cas_number?.toLowerCase().includes(q2) ||
        c.common_name?.toLowerCase().includes(q2),
    );
  }, [data, q]);

  return (
    <>
      <MobileTopbar title="SDS lookup" subtitle="Chemicals & safety data" backHref="/m" />

      <div className="mx-auto max-w-md space-y-4 px-4 pb-24 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or CAS…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Beaker}
            title="No chemicals"
            description={data?.length ? "No match for your search." : "No chemicals registered yet."}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <Card key={c.id} className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 opacity-70" />
                <CardContent className="space-y-2 p-4 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.cas_number ? `CAS ${c.cas_number}` : "—"}
                        {c.manufacturer && ` · ${c.manufacturer}`}
                      </div>
                    </div>
                    {c.signal_word && (
                      <Badge variant={signalVariant[c.signal_word] ?? "warning"}>
                        {c.signal_word}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      {c.quantity_on_hand ?? 0} {c.unit_of_measure ?? ""}
                    </span>
                    {c.storage_location && (
                      <span className="truncate text-muted-foreground">
                        {c.storage_location}
                      </span>
                    )}
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
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View SDS {c.sds_version ? `v${c.sds_version}` : ""} · expires {formatDate(c.sds_expiry_date)}
                    </a>
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
