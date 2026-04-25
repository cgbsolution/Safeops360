"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MobileTopbar } from "@/components/mobile-topbar";
import { api } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { cn } from "@/lib/utils";

const INCIDENT_TYPES = [
  { value: "near_miss", label: "Near miss" },
  { value: "first_aid", label: "First aid" },
  { value: "medical_treatment", label: "Medical treatment" },
  { value: "lti", label: "Lost time" },
  { value: "property_damage", label: "Property damage" },
  { value: "environmental_spill", label: "Environmental spill" },
  { value: "fire", label: "Fire" },
];

const SEVERITIES: { value: "low" | "medium" | "high" | "critical"; label: string; tone: string }[] = [
  { value: "low", label: "Low", tone: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300" },
  { value: "medium", label: "Medium", tone: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300" },
  { value: "high", label: "High", tone: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300" },
  { value: "critical", label: "Critical", tone: "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300" },
];

export default function MobileIncidentNewPage() {
  const router = useRouter();
  const [incident_type, setType] = useState("near_miss");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("low");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [immediate_actions, setImmediateActions] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api<{ id: string }>("/incidents", {
        method: "POST",
        body: JSON.stringify({
          incident_type,
          severity,
          title,
          description: description || undefined,
          location: location || undefined,
          immediate_actions: immediate_actions || undefined,
          occurred_at: new Date().toISOString(),
        }),
      }),
    onSuccess: () => {
      toast({
        title: "Incident reported",
        description: "Thanks — your report has been logged.",
        variant: "success",
      });
      router.push("/m");
    },
    onError: (err) => {
      toast({
        title: "Could not save",
        description: (err as Error).message,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <MobileTopbar title="Report incident" subtitle="Near-miss or injury" backHref="/m" />

      <div className="mx-auto max-w-md space-y-4 px-4 pb-24 pt-4">
        <div className="flex items-center gap-3 rounded-xl border border-red-200/60 bg-gradient-to-br from-red-500/10 to-transparent p-4 dark:border-red-900/40">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-red-500/15 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">You're the reporter</div>
            <div className="text-[11px] text-muted-foreground">
              We'll stamp the report with your name & the current time.
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-5 p-4">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {INCIDENT_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                        incident_type === t.value
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-input bg-background text-foreground hover:bg-accent",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <div className="grid grid-cols-4 gap-2">
                  {SEVERITIES.map((s) => (
                    <button
                      type="button"
                      key={s.value}
                      onClick={() => setSeverity(s.value)}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-xs font-semibold transition-all",
                        severity === s.value ? `${s.tone} ring-2 ring-offset-1 ring-current shadow-sm` : "border-input bg-background text-foreground hover:bg-accent",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Brief summary (e.g. Tool dropped from mezzanine)"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Line 3 — mezzanine B"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">What happened?</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what happened, who was involved, and any impact."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="immediate_actions">Immediate actions taken</Label>
                <Textarea
                  id="immediate_actions"
                  value={immediate_actions}
                  onChange={(e) => setImmediateActions(e.target.value)}
                  rows={3}
                  placeholder="Area cordoned, first aid given, supervisor notified, etc."
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={create.isPending || !title.trim()}
              >
                {create.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Submit report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
