import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Zap } from "lucide-react";
import {
  StellarImpactCards,
  type SimpleMetricCard,
} from "../StellarImpactCards";
import { axe } from "@/test/axe";

const simpleCards: SimpleMetricCard[] = [
  {
    label: "Settlement Time",
    offerhub: "5s",
    traditional: "3-5 days",
    icon: Zap,
    savingsLabel: "Faster",
    savingsValue: "50000x",
    description: "Time to final settlement.",
    higherIsBetter: false,
  },
];

describe("StellarImpactCards accessibility", () => {
  it("has no axe violations in the simple variant", async () => {
    const { container } = render(
      <StellarImpactCards
        variant="simple"
        cards={simpleCards}
        toggleId="metrics-test"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
