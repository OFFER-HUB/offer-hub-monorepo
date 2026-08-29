// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/llms-txt", () => ({
  buildLlmsFull: vi.fn(() => "# Page One\n\nBody.\n\n---\n\n# Page Two\n\nBody.\n"),
}));

import { GET } from "../route";

describe("GET /llms-full.txt", () => {
  it("returns the built concatenation as plain text", async () => {
    const res = await GET();

    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    await expect(res.text()).resolves.toBe(
      "# Page One\n\nBody.\n\n---\n\n# Page Two\n\nBody.\n",
    );
  });
});
