// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const docsRoot = path.join(process.cwd(), "content/docs");
const content = fs.readFileSync(path.join(docsRoot, "api-reference/balance.mdx"), "utf8").replace(/\r\n/g, "\n");
const operations = [
  ["Get", "GET", "", []],
  ["Verify", "GET", "/verify", []],
  ["Credit", "POST", "/credit", ["amount", "description", "reference"]],
  ["Debit", "POST", "/debit", ["amount", "description", "reference"]],
  ["Reserve", "POST", "/reserve", ["amount", "orderId"]],
  ["Release", "POST", "/release", ["amount", "orderId", "sellerId"]],
  ["Cancel reservation", "POST", "/cancel-reservation", ["amount", "orderId"]],
  ["Deduct reserved", "POST", "/deduct-reserved", ["amount", "orderId"]],
  ["Sync", "POST", "/sync", []],
] as const;

function section(title: string): string {
  return content.split(`## ${title}\n`)[1]?.split("\n## ")[0] ?? "";
}

describe("Balance endpoint documentation examples", () => {
  it.each(operations)("%s has matching HTTP and SDK examples", (title, method, suffix, fields) => {
    const text = section(title);
    const tabs = JSON.parse(text.match(/tabs=\{(\[[\s\S]*?\])\} \/>/)![1]) as {
      label: string; code: string;
    }[];
    expect(tabs.map((tab) => tab.label)).toEqual(["cURL", "TypeScript SDK"]);
    expect(tabs[0].code).toContain(`--request ${method}`);
    expect(tabs[0].code).toContain(`/users/usr_buyer123/balance${suffix}"`);
    expect(tabs[0].code).toContain("Authorization: Bearer $OFFERHUB_API_KEY");
    if (method === "POST") expect(tabs[0].code).toContain("Idempotency-Key: $IDEMPOTENCY_KEY");

    if (fields.length) {
      const curlBody = JSON.parse(tabs[0].code.match(/--data '([^']+)'/)![1]);
      const sdkBody = JSON.parse(tabs[1].code.match(/const request = (\{[\s\S]*?\});/)![1]);
      expect(sdkBody).toEqual(curlBody);
      expect(Object.keys(curlBody).sort()).toEqual([...fields].sort());
      expect(curlBody.amount).toMatch(/^\d+\.\d{2}$/);
      expect(Number(curlBody.amount)).toBeGreaterThan(0);
    } else {
      expect(tabs[0].code).not.toContain("--data");
    }
    // Every operation shows a parseable success envelope and an error envelope.
    const examples = [...text.matchAll(/```json\n([\s\S]*?)\n```/g)].map((m) => JSON.parse(m[1]));
    expect(examples[0]).toHaveProperty("data");
    expect(examples[0].meta).toHaveProperty("requestId");
    expect(examples[1].error).toHaveProperty("code");
    expect(examples[1].error).toHaveProperty("message");
  });

  it("keeps ledger arithmetic and the release recipient consistent", () => {
    for (const title of ["Credit", "Debit", "Reserve", "Release", "Cancel reservation", "Deduct reserved"] as const) {
      const text = section(title);
      const result = JSON.parse(text.match(/```json\n([\s\S]*?)\n```/)![1]).data;
      const { balance, previousBalance: previous, newBalance: next } = result;
      const amount = Number(result.amount);
      expect(Number(balance.total)).toBeCloseTo(Number(balance.available) + Number(balance.reserved));
      expect(next).toEqual({ available: balance.available, reserved: balance.reserved });
      expect(balance.user_id).toBe(title === "Release" ? "usr_seller456" : "usr_buyer123");
      const availableDelta = Number(next.available) - Number(previous.available);
      const reservedDelta = Number(next.reserved) - Number(previous.reserved);
      const expected = {
        Credit: [amount, 0], Debit: [-amount, 0], Reserve: [-amount, amount],
        Release: [amount, 0], "Cancel reservation": [amount, -amount], "Deduct reserved": [0, -amount],
      }[title];
      expect([availableDelta, reservedDelta]).toEqual(expected);
    }
  });

  it("links the reference from the overview and SDK guide with a unique sidebar order", () => {
    for (const file of ["api-reference/overview.mdx", "sdk/balance.mdx"]) {
      expect(fs.readFileSync(path.join(docsRoot, file), "utf8")).toContain("/docs/api-reference/balance");
    }
    expect(content).toMatch(/^section: API Reference$/m);
    const order = content.match(/^order: (\d+)$/m)![1];
    const siblings = fs.readdirSync(path.join(docsRoot, "api-reference"))
      .filter((file) => file.endsWith(".mdx") && file !== "balance.mdx");
    for (const file of siblings) {
      expect(fs.readFileSync(path.join(docsRoot, "api-reference", file), "utf8"))
        .not.toMatch(new RegExp(`^order: ${order}$`, "m"));
    }
  });
});
