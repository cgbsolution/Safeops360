"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enqueueAudit } from "@/lib/offline-queue";

export default function MobileAuditNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("safety_walk");
  const [notes, setNotes] = useState("");

  async function save() {
    await enqueueAudit({
      id: crypto.randomUUID(),
      title,
      audit_type: type,
      notes,
      created_at: new Date().toISOString(),
    });
    router.push("/m");
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <button onClick={() => router.back()} className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Card>
        <CardHeader><CardTitle>New audit (offline safe)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Morning walk — Line 3" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Input id="type" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes / findings</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} />
          </div>
          <Button className="w-full" onClick={save} disabled={!title}>
            <Save className="h-4 w-4" /> Save to offline queue
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Saved locally. Sync from the home screen once online.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
