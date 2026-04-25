"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin, Radio, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { CardGridSkeleton } from "@/components/table-skeleton";
import { Separator } from "@/components/ui/separator";

interface Zone {
  id: string;
  name: string;
  zone_class: string | null;
  description: string | null;
  risk_level: string;
  required_permits: string[] | null;
  required_ppe: string[] | null;
  center_latitude: number | null;
  center_longitude: number | null;
  radius_meters: number | null;
  is_active: boolean;
}

const levelVariant: Record<string, "success" | "warning" | "critical"> = {
  low: "success",
  medium: "warning",
  high: "critical",
  critical: "critical",
};

const ringClass: Record<string, string> = {
  low: "from-emerald-500/20",
  medium: "from-amber-500/20",
  high: "from-red-500/20",
  critical: "from-red-600/30",
};

export default function ZonesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: () => api<Zone[]>("/zones"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Register"
        title="Hazardous zones & geofencing"
        description="Classified areas with required permits, PPE and mobile check-in."
        icon={MapPin}
      />

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState icon={MapPin} title="No zones configured" description="Add classified areas to enforce PPE and permits on the floor." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((z) => (
            <Card key={z.id} className="group relative overflow-hidden transition-all hover:shadow-glow">
              <div className={`absolute inset-0 bg-gradient-to-br ${ringClass[z.risk_level] ?? "from-primary/10"} to-transparent opacity-60`} />
              <CardHeader className="relative space-y-2 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {z.name}
                    </CardTitle>
                    {z.zone_class && <CardDescription className="mt-0.5">{z.zone_class}</CardDescription>}
                  </div>
                  <Badge variant={levelVariant[z.risk_level] ?? "info"} className="capitalize">
                    {z.risk_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3 pt-0 text-sm">
                {z.description && <p className="text-muted-foreground">{z.description}</p>}

                {z.required_permits && z.required_permits.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Required permits
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {z.required_permits.map((p) => (
                        <Badge key={p} variant="warning" className="capitalize">
                          {p.replaceAll("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {z.required_ppe && z.required_ppe.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Required PPE
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {z.required_ppe.map((p) => (
                        <Badge key={p} variant="info" className="gap-1">
                          <Shield className="h-3 w-3" /> {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {z.center_latitude && z.center_longitude && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                      <Radio className="h-3.5 w-3.5" />
                      {z.center_latitude.toFixed(3)}, {z.center_longitude.toFixed(3)} · r {z.radius_meters ?? "—"}m
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
