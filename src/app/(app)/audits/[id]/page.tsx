"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Check, ClipboardCheck, Loader2, Save, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "@/lib/use-toast";

interface Question {
  id: string;
  section: string;
  order_index: number;
  question_text: string;
  question_type: string;
  is_required: boolean;
  standard_ref: string | null;
}
interface Template { id: string; name: string; questions: Question[] }
interface Finding {
  id: string;
  severity: string;
  title: string;
  description: string | null;
  standard_ref: string | null;
}
interface AuditDetail {
  id: string;
  reference: string;
  title: string;
  status: string;
  progress_percent: number;
  template_id: string | null;
  responses: { id: string; question_id: string; answer: string | null; notes: string | null }[];
  findings: Finding[];
}

type Pending = Record<string, { answer: string; notes: string }>;

const answerButton: Record<string, { label: string; variant: "success" | "critical" | "neutral"; icon: React.ReactNode }> = {
  pass: { label: "Pass", variant: "success", icon: <Check className="h-3.5 w-3.5" /> },
  fail: { label: "Fail", variant: "critical", icon: <X className="h-3.5 w-3.5" /> },
  na: { label: "N/A", variant: "neutral", icon: <span className="text-[10px] font-bold">—</span> },
};

const severityVariant: Record<string, "success" | "info" | "warning" | "critical"> = {
  compliance: "success",
  observation: "info",
  ofi: "warning",
  nc_minor: "warning",
  nc_major: "critical",
};

export default function AuditDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const { data: audit, refetch, isLoading } = useQuery({
    queryKey: ["audit", id],
    queryFn: () => api<AuditDetail>(`/audits/${id}`),
  });

  const { data: template } = useQuery({
    queryKey: ["template", audit?.template_id],
    enabled: !!audit?.template_id,
    queryFn: () => api<Template>(`/audit-templates/${audit!.template_id}`),
  });

  const initial = useMemo<Pending>(() => {
    const map: Pending = {};
    (audit?.responses ?? []).forEach((r) => {
      map[r.question_id] = { answer: r.answer ?? "", notes: r.notes ?? "" };
    });
    return map;
  }, [audit?.responses]);

  const [pending, setPending] = useState<Pending>(initial);

  // Sync pending when data changes
  useEffect(() => {
    setPending(initial);
  }, [initial]);

  const save = useMutation({
    mutationFn: (mark: boolean) =>
      api<AuditDetail>(`/audits/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({
          responses: Object.entries(pending).map(([question_id, v]) => ({
            question_id,
            answer: v.answer || null,
            notes: v.notes || null,
          })),
          mark_submitted: mark,
        }),
      }),
    onSuccess: (_, mark) => {
      toast({
        title: mark ? "Audit submitted" : "Progress saved",
        description: mark ? "The audit is now in review." : "Your responses were saved.",
        variant: "success",
      });
      refetch();
    },
    onError: (err) => {
      toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" });
    },
  });

  if (isLoading || !audit) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const bySection: Record<string, Question[]> = {};
  (template?.questions ?? []).forEach((q) => {
    (bySection[q.section] ||= []).push(q);
  });

  const answered = Object.values(pending).filter((v) => v.answer).length;
  const total = (template?.questions ?? []).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={audit.reference}
        title={audit.title}
        description="Run the audit, capture notes, and log findings. Save progress any time."
        icon={ClipboardCheck}
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push("/audits")}>
              <ArrowLeft className="h-4 w-4" /> All audits
            </Button>
            <Button variant="outline" disabled={save.isPending} onClick={() => save.mutate(false)}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save progress
            </Button>
            <Button variant="gradient" disabled={save.isPending} onClick={() => save.mutate(true)}>
              <Send className="h-4 w-4" /> Submit
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
            <Badge variant="info" className="mt-1 capitalize">{audit.status.replaceAll("_", " ")}</Badge>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Progress</div>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={audit.progress_percent} className="h-2" />
              <span className="text-xs tabular-nums text-muted-foreground">{audit.progress_percent}%</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Questions answered</div>
            <div className="mt-1 text-sm font-semibold tabular-nums">
              {answered} <span className="text-muted-foreground">/ {total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(bySection).length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              className="border-0 bg-transparent"
              icon={AlertTriangle}
              title="No template questions"
              description="This audit doesn't have a template attached. Link a template to start capturing responses."
            />
          </CardContent>
        </Card>
      ) : (
        Object.entries(bySection).map(([section, items]) => (
          <Card key={section}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{section}</CardTitle>
                  <CardDescription>{items.length} question(s) in this section</CardDescription>
                </div>
                <Badge variant="neutral">{items.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.sort((a, b) => a.order_index - b.order_index).map((q) => {
                const current = pending[q.id] ?? { answer: "", notes: "" };
                return (
                  <div key={q.id} className="rounded-xl border bg-background p-4 transition-colors hover:bg-muted/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">{q.question_text}</div>
                        {q.standard_ref && (
                          <div className="mt-0.5 text-xs text-muted-foreground">Ref: {q.standard_ref}</div>
                        )}
                      </div>
                      {q.is_required && <Badge variant="warning">Required</Badge>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(answerButton).map(([option, cfg]) => (
                        <button
                          key={option}
                          onClick={() =>
                            setPending((p) => ({ ...p, [q.id]: { ...current, answer: option } }))
                          }
                          className={cn(
                            "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all",
                            current.answer === option
                              ? cfg.variant === "success"
                                ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                                : cfg.variant === "critical"
                                ? "border-red-500 bg-red-500 text-white shadow-sm"
                                : "border-foreground bg-foreground text-background shadow-sm"
                              : "border-input bg-background text-foreground hover:bg-accent",
                          )}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      className="mt-3"
                      placeholder="Notes / observations (optional)"
                      value={current.notes}
                      onChange={(e) =>
                        setPending((p) => ({ ...p, [q.id]: { ...current, notes: e.target.value } }))
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}

      <Card>
        <CardHeader>
          <CardTitle>Findings</CardTitle>
          <CardDescription>Non-conformances and observations logged against this audit.</CardDescription>
        </CardHeader>
        <CardContent>
          {audit.findings.length === 0 ? (
            <EmptyState
              className="border-0 bg-transparent"
              icon={ClipboardCheck}
              title="No findings yet"
              description="Findings will appear here once added during the audit run."
            />
          ) : (
            <div className="space-y-2">
              {audit.findings.map((f) => (
                <div key={f.id} className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={severityVariant[f.severity] ?? "info"} className="capitalize">
                      {f.severity.replaceAll("_", " ")}
                    </Badge>
                    <span className="font-medium">{f.title}</span>
                  </div>
                  {f.description && <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>}
                  {f.standard_ref && (
                    <>
                      <Separator className="my-3" />
                      <div className="text-xs text-muted-foreground">Standard: {f.standard_ref}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
