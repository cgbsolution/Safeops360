"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ClipboardCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { toast } from "@/lib/use-toast";

interface TemplateSlim { id: string; name: string }
interface SiteSlim { id: string; name: string }

const AUDIT_TYPES = [
  { value: "safety_walk", label: "Safety walk" },
  { value: "internal", label: "Internal audit" },
  { value: "external", label: "External audit" },
  { value: "regulatory", label: "Regulatory inspection" },
  { value: "process_safety", label: "Process safety" },
];

export default function NewAuditPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [audit_type, setAuditType] = useState("safety_walk");
  const [scope, setScope] = useState("");
  const [scheduled_date, setScheduledDate] = useState("");
  const [site_id, setSiteId] = useState("");
  const [template_id, setTemplateId] = useState("");

  const { data: templates } = useQuery({ queryKey: ["templates"], queryFn: () => api<TemplateSlim[]>("/audit-templates") });
  const { data: sites } = useQuery({ queryKey: ["sites"], queryFn: () => api<SiteSlim[]>("/organizations/me/sites") });

  const create = useMutation({
    mutationFn: () =>
      api<{ id: string }>("/audits", {
        method: "POST",
        body: JSON.stringify({
          title,
          audit_type,
          scope: scope || undefined,
          scheduled_date: scheduled_date || undefined,
          site_id: site_id || undefined,
          template_id: template_id || undefined,
        }),
      }),
    onSuccess: (audit) => {
      toast({ title: "Audit created", description: "You can now run the audit or add responses.", variant: "success" });
      router.push(`/audits/${audit.id}`);
    },
    onError: (err) => {
      toast({ title: "Could not create audit", description: (err as Error).message, variant: "destructive" });
    },
  });

  const selectCls =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="New audit"
        title="Schedule an audit"
        description="Pick a template, assign a site, and set the schedule."
        icon={ClipboardCheck}
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <Card>
        <CardHeader><CardTitle>Audit details</CardTitle></CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Morning safety walk — Line 3"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="audit_type">Type</Label>
                <select
                  id="audit_type"
                  value={audit_type}
                  onChange={(e) => setAuditType(e.target.value)}
                  className={selectCls}
                >
                  {AUDIT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scheduled_date">Scheduled date</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={scheduled_date}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="site">Site</Label>
                <select id="site" className={selectCls} value={site_id} onChange={(e) => setSiteId(e.target.value)}>
                  <option value="">— None —</option>
                  {(sites ?? []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="template">Template</Label>
                <select id="template" className={selectCls} value={template_id} onChange={(e) => setTemplateId(e.target.value)}>
                  <option value="">— None —</option>
                  {(templates ?? []).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scope">Scope / notes</Label>
              <Textarea
                id="scope"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Optional notes — areas to focus on, observations, etc."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={create.isPending}>
                {create.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                  </>
                ) : (
                  "Create audit"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
