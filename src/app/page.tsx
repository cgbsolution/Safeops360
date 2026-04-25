import Link from "next/link";
import { ArrowRight, HardHat, Flame, Factory, Car, ShoppingBasket, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const industries = [
  { icon: HardHat, label: "Construction", tagline: "Sites, heights, excavation" },
  { icon: Flame, label: "Oil & Gas", tagline: "PSM, confined space, hot work" },
  { icon: Factory, label: "Manufacturing", tagline: "LOTO, guarding, ergonomics" },
  { icon: Car, label: "Automotive", tagline: "Lean plants, paint-shop hazards" },
  { icon: ShoppingBasket, label: "FMCG", tagline: "Hygiene, allergen, cold chain" },
  { icon: Pill, label: "Pharma", tagline: "cGMP, cleanroom, deviations" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-bold">S</div>
            <span className="text-lg font-semibold">SafeOps360</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/m">
              <Button variant="outline">Mobile app</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="container grid items-center gap-10 py-16 md:grid-cols-2">
        <div className="space-y-5">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            One QHSE platform for every industry.
          </h1>
          <p className="text-lg text-muted-foreground">
            Digital audits, permit-to-work, incident investigation, chemical management, risk register,
            training & hazardous-zone check-ins — configurable for construction, oil & gas, manufacturing,
            automotive, FMCG and pharma. Web, mobile (offline-ready), APIs.
          </p>
          <div className="flex gap-3">
            <Link href="/login">
              <Button size="lg">
                Open the console <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/m">
              <Button size="lg" variant="outline">
                Launch mobile
              </Button>
            </Link>
          </div>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Modules out of the box</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {[
              "Digital audits & inspections",
              "Permit-to-work with approvals",
              "Incident & near-miss investigation",
              "CAPA / Action tracking",
              "Risk register (HIRA)",
              "Chemical / SDS register",
              "Training & certifications",
              "Hazardous-zone geofencing",
              "Offline-first mobile",
              "Industry-specific KPIs",
            ].map((feat) => (
              <div key={feat} className="rounded-md border bg-muted/30 p-3">{feat}</div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="container">
          <h2 className="mb-6 text-center text-2xl font-semibold">Configured per industry</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {industries.map(({ icon: Icon, label, tagline }) => (
              <Card key={label}>
                <CardContent className="space-y-1 p-5 text-center">
                  <Icon className="mx-auto h-7 w-7 text-primary" />
                  <div className="font-semibold">{label}</div>
                  <div className="text-xs text-muted-foreground">{tagline}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
