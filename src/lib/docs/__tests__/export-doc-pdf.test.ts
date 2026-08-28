import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportDocPdf } from "../export-doc-pdf";

const saveMock = vi.fn().mockResolvedValue(undefined);
const fromMock = vi.fn(() => ({ save: saveMock }));
const setMock = vi.fn(() => ({ from: fromMock }));
const html2pdfMock = vi.fn(() => ({ set: setMock }));

vi.mock("html2pdf.js", () => ({
  default: (...args: unknown[]) => html2pdfMock(...args),
}));

// This is a deliberately shallow smoke test: exportDocPdf is fundamentally
// DOM + third-party-library (html2pdf.js/html2canvas) orchestration with
// side effects, so it's asserted at the "did it wire the library up and
// clean up after itself" level rather than pixel/content level.
describe("exportDocPdf", () => {
  let contentEl: HTMLElement;

  beforeEach(() => {
    contentEl = document.createElement("div");
    contentEl.id = "doc-page-export-content";
    contentEl.innerHTML = "<p>Hello</p>";
    document.body.appendChild(contentEl);

    saveMock.mockClear().mockResolvedValue(undefined);
    fromMock.mockClear();
    setMock.mockClear();
    html2pdfMock.mockClear();
  });

  afterEach(() => {
    contentEl.remove();
    document.querySelectorAll("[data-doc-pdf-root]").forEach((el) => el.remove());
  });

  it("throws when the export content container is missing", async () => {
    contentEl.remove();

    await expect(exportDocPdf({ slug: "s", title: "T" })).rejects.toThrow(
      "Could not find docs content container.",
    );
  });

  it("builds an offscreen export container, generates the PDF, and cleans up", async () => {
    await exportDocPdf({ slug: "getting-started", title: "Getting Started", description: "A guide." });

    expect(html2pdfMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: expect.stringMatching(/^getting-started-\d{4}-\d{2}-\d{2}\.pdf$/),
      }),
    );
    expect(fromMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledTimes(1);

    expect(document.querySelector("[data-doc-pdf-root]")).not.toBeInTheDocument();
  });

  it("cleans up the offscreen container even when the underlying export fails", async () => {
    saveMock.mockRejectedValueOnce(new Error("save failed"));

    await expect(
      exportDocPdf({ slug: "getting-started", title: "Getting Started" }),
    ).rejects.toThrow("save failed");

    expect(document.querySelector("[data-doc-pdf-root]")).not.toBeInTheDocument();
  });
});
