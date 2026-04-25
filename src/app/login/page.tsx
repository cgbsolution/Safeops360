"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Activity, AlertCircle, Loader2, Lock, Mail, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, setTokens } from "@/lib/api";
import { toast } from "@/lib/use-toast";

const highlights = [
  { icon: ShieldCheck, label: "Zero-paper audits", hint: "Offline-first mobile capture" },
  { icon: TrendingUp, label: "Live MIS", hint: "TRIR, LTIFR, severity trends" },
  { icon: Sparkles, label: "Industry-tuned", hint: "Auto adapts to your sector" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@safeops360.io");
  const [password, setPassword] = useState("Passw0rd!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await api<{ access_token: string; refresh_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setTokens(tokens.access_token, tokens.refresh_token);
      toast({
        title: "Welcome back",
        description: "You're signed in. Loading your operations dashboard…",
        variant: "success",
      });
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast({ title: "Sign in failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-[420px] w-[420px] rounded-full bg-chart-6/10 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* LEFT — brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-r bg-gradient-to-br from-primary/5 via-background to-chart-6/5 p-10 lg:flex">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-6 text-primary-foreground shadow-glow">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">SafeOps360</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                QHSE platform
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Industrial safety,
              <br />
              <span className="bg-gradient-to-r from-primary to-chart-6 bg-clip-text text-transparent">
                operationalised.
              </span>
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              The industry-agnostic QHSE platform for audits, permits, incidents, chemicals, training,
              and CAPA — built for construction, oil & gas, manufacturing, automotive, FMCG, and pharma.
            </p>

            <div className="grid gap-2">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center gap-3 rounded-xl border bg-card/60 p-3 backdrop-blur-sm"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary/10 to-chart-6/10 text-primary">
                    <h.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{h.label}</div>
                    <div className="text-[11px] text-muted-foreground">{h.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SafeOps360 · Industrial grade.
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex items-center justify-center p-6 lg:p-10">
          <Card className="w-full max-w-md border-0 shadow-glow lg:border">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-6 text-primary-foreground shadow-glow lg:hidden">
                <Activity className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl">Sign in to SafeOps360</CardTitle>
              <CardDescription>Use the seed demo credentials to explore the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                    <span className="bg-card px-2 text-muted-foreground">Demo accounts</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  {["admin", "auditor", "worker"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setEmail(`${role}@safeops360.io`);
                        setPassword("Passw0rd!");
                      }}
                      className="rounded-lg border bg-muted/30 px-2 py-2 font-medium capitalize transition-colors hover:bg-accent"
                    >
                      {role}
                    </button>
                  ))}
                </div>
                <p className="text-center text-[11px] text-muted-foreground">
                  Password: <code className="rounded bg-muted px-1 font-mono">Passw0rd!</code>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
