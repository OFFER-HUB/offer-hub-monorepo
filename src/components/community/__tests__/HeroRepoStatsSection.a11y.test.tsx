import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { HeroRepoStatsSection } from "../HeroRepoStatsSection";
import { axe } from "@/test/axe";

describe("HeroRepoStatsSection accessibility", () => {
  it("has no axe violations with live stats", async () => {
    const { container } = render(
      <HeroRepoStatsSection
        stats={{ stars: "120", forks: "34", contributors: "56", openIssues: "12" }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when stats are unavailable", async () => {
    const { container } = render(<HeroRepoStatsSection stats={null} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
