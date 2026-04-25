"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, LogIn, MapPin, Radio, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { MobileTopbar } from "@/components/mobile-topbar";
import { api } from "@/lib/api";
import { toast } from "@/lib/use-toast";

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

function getGeo(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000 },
    );
  });
}

export default function MobileZonesPage() {
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: () => api<Zone[]>("/zones"),
  });

  const checkin = useMutation({
    mutationFn: async (zone_id: string) => {
      setCheckingIn(zone_id);
      const pos = await getGeo();
      return api("/zones/checkins", {
        method: "POST",
        body: JSON.stringify({
          zone_id,
          latitude: pos?.coords.latitude,
          longitude: pos?.coords.longitude,
        }),
      });
    },
    onSuccess: () => {
      toast({ title: "Checked in", description: "Your check-in is logged.", variant: "success" });
      setCheckingIn(null);
    },
    onError: (err) => {
      toast({ title: "Check-in failed", description: (err as Error).message, variant: "destructive" });
      setCheckingIn(null);
    },
  });

  return (
    <>
      <MobileTopbar title="Zone check-in" subtitle="Classified areas & geofences" backHref="/m" />

      <div className="mx-auto max-w-md space-y-3 px-4 pb-24 pt-4">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : (data ?? []).length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No zones"
            description="No hazardous zones are configured yet."
          />
        ) : (
          (data ?? []).map((z) => {
            const pending = checkingIn === z.id && checkin.isPending;
            return (
              <Card key={z.id} className="overflow-hidden">
                <div
                  className={`h-1 ${
                    z.risk_level === "critical" || z.risk_level === "high"
                      ? "bg-red-500"
                      : z.risk_level === "medium"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="truncate">{z.name}</span>
                      </div>
                      {z.zone_class && (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{z.zone_class}</div>
                      )}
                    </div>
                    <Badge variant={levelVariant[z.risk_level] ?? "info"} className="capitalize">
                      {z.risk_level}
                    </Badge>
                  </div>

                  {z.description && (
                    <p className="text-xs text-muted-foreground">{z.description}</p>
                  )}

                  {z.required_ppe && z.required_ppe.length > 0 && (
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        PPE required
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {z.required_ppe.map((p) => (
                          <Badge key={p} variant="info" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {z.center_latitude && z.center_longitude && (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                      <Radio className="h-3.5 w-3.5" />
                      {z.center_latitude.toFixed(3)}, {z.center_longitude.toFixed(3)}
                      {z.radius_meters && <> · r {z.radius_meters}m</>}
                    </div>
                  )}

                  <Button
                    variant="gradient"
                    size="sm"
                    className="w-full"
                    disabled={pending}
                    onClick={() => checkin.mutate(z.id)}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Checking in…
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" /> Check in
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
