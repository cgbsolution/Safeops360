"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, HelpCircle, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { CardGridSkeleton } from "@/components/table-skeleton";

interface TemplateRow {
  id: string;
  name: string;
  category: string | null;
  industry: string | null;
  is_published: boolean;
  description: string | null;
  questions: { id: string }[];
}

export default function TemplatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => api<TemplateRow[]>("/audit-templates"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Audit templates"
        description="Reusable checklists with sections, scoring and standard references."
        icon={FileText}
      />

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState icon={FileText} title="No templates yet" description="Create an audit template to standardize your inspections." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((t) => (
            <Card key={t.id} className="group transition-all hover:shadow-glow">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-chart-6/15 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  {t.is_published ? <Badge variant="success">Published</Badge> : <Badge variant="neutral">Draft</Badge>}
                </div>
                <div>
                  <CardTitle className="leading-tight">{t.name}</CardTitle>
                  {t.description && (
                    <CardDescription className="mt-1 line-clamp-2">{t.description}</CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {t.category && <Badge variant="secondary" className="capitalize">{t.category}</Badge>}
                  {t.industry && <Badge variant="info" className="capitalize">{t.industry}</Badge>}
                </div>
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" /> {t.questions.length} questions
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Template
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
