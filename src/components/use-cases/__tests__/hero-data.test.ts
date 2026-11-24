import { describe, it, expect } from "vitest";

import { useCaseData as freelance } from "../freelance/data";
import { useCaseData as ecommerce } from "../ecommerce/data";
import { useCaseData as daoPayroll } from "../dao-payroll/data";
import { useCaseData as realEstate } from "../real-estate/data";
import { useCaseData as servicePlatforms } from "../service-platforms/data";
import { getSourcedMetrics, type UseCaseData } from "../types";

const CASES: Array<[string, UseCaseData]> = [
  ["freelance", freelance],
  ["ecommerce", ecommerce],
  ["dao-payroll", daoPayroll],
  ["real-estate", realEstate],
  ["service-platforms", servicePlatforms],
];

describe.each(CASES)("useCaseData: %s", (slug, data) => {
  it("identifies the vertical consistently", () => {
    expect(data.id).toBe(slug);
    expect(data.label.length).toBeGreaterThan(0);
    expect(data.icon).toBeTruthy();
  });

  it("has the required hero copy and links", () => {
    expect(data.hero.badgeLabel).toMatch(/^CASE STUDY:/);
    expect(data.hero.headline.length).toBeGreaterThan(0);
    expect(data.hero.subheadline.length).toBeGreaterThan(0);
    expect(data.hero.docsUrl).toMatch(
      /^https:\/\/.*\/docs\/business\/use-cases\.md/,
    );
    expect(data.hero.stats).toHaveLength(3);
    for (const stat of data.hero.stats) {
      expect(stat.label.length).toBeGreaterThan(0);
      expect(stat.value.length).toBeGreaterThan(0);
      expect(stat.accent.length).toBeGreaterThan(0);
    }
  });

  it("has summary copy and feature cards", () => {
    expect(data.summary.eyebrow.length).toBeGreaterThan(0);
    expect(data.summary.title.length).toBeGreaterThan(0);
    expect(data.summary.body.length).toBeGreaterThan(0);
    expect(data.features.length).toBeGreaterThan(0);

    for (const feature of data.features) {
      expect(feature.icon).toBeTruthy();
      expect(feature.title.length).toBeGreaterThan(0);
      expect(feature.body.length).toBeGreaterThan(0);
    }
  });

  it("has a complete, sequentially numbered flow", () => {
    expect(data.flow.length).toBeGreaterThan(0);

    data.flow.forEach((step, index) => {
      expect(step.stepNumber).toBe(index + 1);
      expect(step.icon).toBeTruthy();
      expect(step.label.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
      expect(step.apiMethod.length).toBeGreaterThan(0);
      expect(step.apiSnippet.length).toBeGreaterThan(0);
    });
  });

  it("only exposes metrics that cite a public source", () => {
    if (!data.metrics) return;

    const sourced = getSourcedMetrics(data.metrics);
    expect(sourced).not.toBeNull();
    expect(sourced).toHaveLength(data.metrics.length);

    for (const metric of sourced ?? []) {
      expect(metric.source?.label.length).toBeGreaterThan(0);
      expect(metric.source?.url).toMatch(/^https:\/\//);
    }
  });

  it("has usable code samples and SDK cards", () => {
    expect(data.code.heading.length).toBeGreaterThan(0);
    expect(data.code.description.length).toBeGreaterThan(0);
    expect(data.code.tabs.length).toBeGreaterThan(0);
    expect(data.code.sdkCards.length).toBeGreaterThan(0);

    for (const tab of data.code.tabs) {
      expect(tab.label.length).toBeGreaterThan(0);
      expect(tab.language.length).toBeGreaterThan(0);
      expect(tab.code.length).toBeGreaterThan(0);
      expect(tab.docHref).toMatch(/^https:\/\//);
    }
  });
});

describe("getSourcedMetrics", () => {
  it("omits the metrics card when no metrics exist", () => {
    expect(getSourcedMetrics(undefined)).toBeNull();
    expect(getSourcedMetrics([])).toBeNull();
  });

  it("omits the whole card when any metric lacks a source", () => {
    expect(
      getSourcedMetrics([
        {
          id: "sourced",
          label: "Sourced",
          value: "1",
          description: "Has a source.",
          source: { label: "Example", url: "https://example.com" },
        },
        {
          id: "unsourced",
          label: "Unsourced",
          value: "2",
          description: "Missing a source.",
        },
      ]),
    ).toBeNull();
  });

  it("keeps metrics when every one is sourced", () => {
    const metrics = [
      {
        id: "sourced",
        label: "Sourced",
        value: "1",
        description: "Has a source.",
        source: { label: "Example", url: "https://example.com" },
      },
    ];

    expect(getSourcedMetrics(metrics)).toHaveLength(1);
  });
});
