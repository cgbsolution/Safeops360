"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, GraduationCap, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TableSkeleton } from "@/components/table-skeleton";

interface Course {
  id: string;
  code: string;
  title: string;
  category: string | null;
  duration_minutes: number;
  is_mandatory: boolean;
  recurrence_months: number | null;
  industry_tags: string[] | null;
}

export default function TrainingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["training"],
    queryFn: () => api<Course[]>("/training/courses"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Register"
        title="Training & certifications"
        description="Mandatory course catalog, role-based assignments and expiries."
        icon={GraduationCap}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : (data ?? []).length === 0 ? (
            <EmptyState
              className="m-4 border-0 bg-transparent"
              icon={GraduationCap}
              title="No courses yet"
              description="Add courses to start tracking competency and expiries."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Mandatory</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{c.code}</TableCell>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="text-muted-foreground">{c.category ?? "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {c.duration_minutes}m
                      </span>
                    </TableCell>
                    <TableCell>
                      {c.recurrence_months ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Repeat className="h-3.5 w-3.5" /> {c.recurrence_months} months
                        </span>
                      ) : (
                        <span className="text-muted-foreground">One-off</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.is_mandatory ? (
                        <Badge variant="warning">Mandatory</Badge>
                      ) : (
                        <Badge variant="neutral">Optional</Badge>
                      )}
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
