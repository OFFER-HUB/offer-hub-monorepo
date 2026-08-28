import { describe, it, expect } from "vitest";
import { buildDocExportJson } from "../export-doc-json";

function buildRoot(innerHTML: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = innerHTML;
  return root;
}

describe("buildDocExportJson", () => {
  it("groups content under each h2/h3 heading into a section", () => {
    const root = buildRoot(`
      <h2 id="intro">Introduction</h2>
      <p>Welcome to the docs.</p>
      <h3 id="setup">Setup</h3>
      <p>Install the package.</p>
    `);

    const result = buildDocExportJson(root, "getting-started", "Getting Started");

    expect(result).toEqual({
      title: "Getting Started",
      slug: "getting-started",
      sections: [
        { heading: "Introduction", level: 2, content: "Welcome to the docs.", codeBlocks: [] },
        { heading: "Setup", level: 3, content: "Install the package.", codeBlocks: [] },
      ],
    });
  });

  it("extracts fenced code blocks and detects their language, removing them from the text content", () => {
    const root = buildRoot(`
      <h2 id="install">Install</h2>
      <p>Run this:</p>
      <pre><code class="language-bash">npm install offer-hub</code></pre>
    `);

    const result = buildDocExportJson(root, "getting-started", "Getting Started");

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].content).toBe("Run this:");
    expect(result.sections[0].codeBlocks).toEqual([{ language: "bash", code: "npm install offer-hub" }]);
  });

  it("returns null language when the code block has no language-x className", () => {
    const root = buildRoot(`
      <h2 id="raw">Raw</h2>
      <pre><code>some text</code></pre>
    `);

    const result = buildDocExportJson(root, "s", "T");

    expect(result.sections[0].codeBlocks).toEqual([{ language: null, code: "some text" }]);
  });

  it("collapses runs of internal whitespace in normalized section content", () => {
    const root = buildRoot(`
      <h2 id="spacing">Spacing</h2>
      <p>Line   with   internal   gaps.</p>
    `);

    const result = buildDocExportJson(root, "s", "T");

    expect(result.sections[0].content).toBe("Line with internal gaps.");
  });

  it("returns an empty sections array when there are no headings", () => {
    const root = buildRoot(`<p>No headings here.</p>`);

    const result = buildDocExportJson(root, "no-headings", "No Headings");

    expect(result).toEqual({ title: "No Headings", slug: "no-headings", sections: [] });
  });

  it("only picks up headings that carry an id (skips untagged headings)", () => {
    const root = buildRoot(`
      <h2>No id here, should be skipped</h2>
      <h2 id="real">Real section</h2>
      <p>Content.</p>
    `);

    const result = buildDocExportJson(root, "s", "T");

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].heading).toBe("Real section");
  });
});
