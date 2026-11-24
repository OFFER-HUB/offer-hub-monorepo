import type { LucideIcon } from "lucide-react";

export const USE_CASE_IDS = [
  "freelance",
  "ecommerce",
  "dao-payroll",
  "real-estate",
  "service-platforms",
] as const;

export type UseCaseId = (typeof USE_CASE_IDS)[number];

export interface UseCaseHeroStat {
  label: string;
  value: string;
  accent: string;
}

export interface UseCaseHeroData {
  badgeLabel: string;
  headline: string;
  subheadline: string;
  docsUrl: string;
  ctaLabel?: string;
  stats: UseCaseHeroStat[];
}

export interface UseCaseSummary {
  eyebrow: string;
  title: string;
  body: string;
}

export interface UseCaseFeature {
  icon: LucideIcon;
  title: string;
  body: string;
}

export type UseCaseFlowStatus =
  | "CREATED"
  | "FUNDED"
  | "AWAITING_RELEASE"
  | "SUCCEEDED";

export interface UseCaseFlowStep {
  stepNumber: number;
  label: string;
  status: UseCaseFlowStatus;
  icon: LucideIcon;
  apiMethod: string;
  apiSnippet: string;
  description: string;
  isOnChain: boolean;
}

export interface UseCaseMetricSource {
  label: string;
  url: string;
}

export interface UseCaseMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  description: string;
  /**
   * Public citation for the value. Metrics without a complete source are not
   * rendered — see `getSourcedMetrics`.
   */
  source?: UseCaseMetricSource;
}

export interface UseCaseCodeTab {
  id: string;
  label: string;
  language: string;
  description: string;
  docHref: string;
  docLabel: string;
  code: string;
}

export interface UseCaseSdkCard {
  method: string;
  label: string;
  detail: string;
}

export interface UseCaseCode {
  heading: string;
  description: string;
  tabs: UseCaseCodeTab[];
  sdkCards: UseCaseSdkCard[];
}

export interface UseCaseSeo {
  title: string;
  description: string;
  keywords: string[];
}

export interface UseCaseData {
  id: UseCaseId;
  label: string;
  icon: LucideIcon;
  seo: UseCaseSeo;
  hero: UseCaseHeroData;
  summary: UseCaseSummary;
  features: UseCaseFeature[];
  flow: UseCaseFlowStep[];
  metrics?: UseCaseMetric[];
  code: UseCaseCode;
}

export function isUseCaseId(
  value: string | null | undefined,
): value is UseCaseId {
  return Boolean(value) && (USE_CASE_IDS as readonly string[]).includes(value!);
}

/**
 * Returns the metrics only when every one of them cites a public source.
 * Otherwise the whole metrics card is omitted, so the page never presents an
 * unsourced number.
 */
export function getSourcedMetrics(
  metrics: UseCaseMetric[] | undefined,
): UseCaseMetric[] | null {
  if (!metrics || metrics.length === 0) return null;

  const everyMetricIsSourced = metrics.every(
    (metric) =>
      Boolean(metric.source?.label.trim()) &&
      Boolean(metric.source?.url.trim()),
  );

  return everyMetricIsSourced ? metrics : null;
}
