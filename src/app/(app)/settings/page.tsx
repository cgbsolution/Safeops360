"use client";

import { Building2, Mail, Settings as SettingsIcon, Shield, UserCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";

function initials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function SettingsPage() {
  const user = useAuth((s) => s.user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Account & preferences"
        description="Organization details, profile & role-based access."
        icon={SettingsIcon}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <UserCircle2 className="h-4 w-4 text-primary" /> Profile
            </CardTitle>
            <CardDescription>Signed in as {user?.email ?? "—"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                <AvatarFallback className="text-base">{initials(user?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-lg font-semibold">{user?.full_name ?? "—"}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="info" className="capitalize">{user?.role ?? "role"}</Badge>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {user?.email ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Organization</dt>
                <dd className="mt-1 flex items-center gap-2 font-medium">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {user?.organization_name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role</dt>
                <dd className="mt-1 flex items-center gap-2 font-medium capitalize">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  {user?.role ?? "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Security</CardTitle>
            <CardDescription>Signed-in session status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Auth method</span>
              <Badge variant="secondary">JWT</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
              <span className="text-muted-foreground">Session</span>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="pt-1 text-xs text-muted-foreground">
              To rotate your password or enable SSO, contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
