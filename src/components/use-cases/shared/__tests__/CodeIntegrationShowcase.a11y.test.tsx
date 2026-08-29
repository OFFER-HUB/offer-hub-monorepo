import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Terminal } from "lucide-react";
import {
  CodeIntegrationShowcase,
  type CodeTab,
} from "../CodeIntegrationShowcase";
import { axe } from "@/test/axe";

const tabs: CodeTab[] = [
  {
    id: "node",
    label: "Node.js",
    lang: "typescript",
    icon: Terminal,
    description: "Server-side SDK usage",
    docHref: "https://example.com/docs/node",
    docLabel: "Node.js SDK",
    code: "const escrow = await client.escrows.create();",
  },
  {
    id: "python",
    label: "Python",
    lang: "python",
    icon: Terminal,
    description: "Python SDK usage",
    docHref: "https://example.com/docs/python",
    docLabel: "Python SDK",
    code: "escrow = client.escrows.create()",
  },
];

describe("CodeIntegrationShowcase accessibility", () => {
  it("exposes a valid tablist/tab/tabpanel structure with no axe violations", async () => {
    const { container, getByRole } = render(
      <CodeIntegrationShowcase
        description="lets you integrate escrow flows in minutes."
        tabs={tabs}
        sdkCards={[
          { method: "client.escrows.create()", label: "Create", detail: "Creates a new escrow." },
        ]}
      />,
    );

    expect(getByRole("tablist", { name: /sdk language/i })).toBeInTheDocument();
    expect(getByRole("tab", { name: /node\.js/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
