export type Industry =
  | "construction"
  | "oilgas"
  | "manufacturing"
  | "automotive"
  | "fmcg"
  | "pharma";

export const INDUSTRY_LABELS: Record<Industry, string> = {
  construction: "Construction",
  oilgas: "Oil & Gas",
  manufacturing: "Manufacturing",
  automotive: "Automotive",
  fmcg: "FMCG",
  pharma: "Pharma",
};

export interface IndustryProfile {
  industry: Industry;
  label: string;
  tagline: string;
  primary_permits: string[];
  standards: string[];
  audit_templates: string[];
  kpis: string[];
}
