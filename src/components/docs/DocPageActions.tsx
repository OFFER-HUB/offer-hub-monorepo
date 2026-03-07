"use client";

import { useMemo, useState } from "react";
import { Download, FileCode2, FileJson, FileText, Github } from "lucide-react";

import type { DocFrontmatter } from "@/lib/mdx";

interface DocPageActionsProps {
  slug: string;
  title: string;
  description?: string;
  markdownContent: string;
  frontmatter: DocFrontmatter;
}

const DOCS_REPO_BASE = "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/content/docs";

function dateStamp() {
  return new Date().toISOString().split("T")[0];
}

function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function DocPageActions({ slug, title, description, markdownContent, frontmatter }: DocPageActionsProps) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const markdownFileName = useMemo(() => `${slug.replace(/\//g, "-")}-${dateStamp()}.md`, [slug]);
  const jsonFileName = useMemo(() => `${slug.replace(/\//g, "-")}-${dateStamp()}.json`, [slug]);
  const pdfFileName = useMemo(() => `${slug.replace(/\//g, "-")}-${dateStamp()}.pdf`, [slug]);

  function handleExportMarkdown() {
    downloadBlob(markdownFileName, markdownContent, "text/markdown;charset=utf-8");
  }

  function handleExportJson() {
    const payload = {
      slug,
      title,
      description,
      frontmatter,
      content: markdownContent,
      exportedAt: new Date().toISOString(),
    };

    downloadBlob(jsonFileName, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }

  async function handleExportPdf() {
    setIsExportingPdf(true);

    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;
      const source = document.getElementById("doc-page-export-content");

      if (!source) {
        throw new Error("Could not find docs content container.");
      }

      const exportContainer = document.createElement("section");
      exportContainer.setAttribute("data-doc-pdf-root", "true");
      exportContainer.style.position = "fixed";
      exportContainer.style.left = "-100000px";
      exportContainer.style.top = "0";
      exportContainer.style.width = "850px";
      exportContainer.style.background = "#ffffff";
      exportContainer.style.padding = "28px 34px";
      exportContainer.style.fontFamily = "Inter, Roboto, Arial, sans-serif";
      exportContainer.style.color = "#6D758F";

      const logo = `${window.location.origin}/OFFER-HUB-logo.png`;
      const printableDate = new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      exportContainer.innerHTML = `
        <header style="display:flex;align-items:center;justify-content:space-between;gap:20px;padding-bottom:18px;border-bottom:1px solid #e5e7eb;margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${logo}" alt="OFFER-HUB" style="height:36px;width:auto;object-fit:contain;" />
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px;letter-spacing:0.08em;color:#149A9B;font-weight:700;text-transform:uppercase;">Documentation Export</div>
            <div style="font-size:12px;color:#6D758F;">${printableDate}</div>
          </div>
        </header>
        <h1 style="font-size:30px;line-height:1.2;margin:0 0 8px;color:#19213D;">${title}</h1>
        ${description ? `<p style="font-size:14px;line-height:1.6;margin:0 0 18px;color:#6D758F;">${description}</p>` : ""}
      `;

      const clonedContent = source.cloneNode(true) as HTMLElement;

      // Remove action buttons and any controls from PDF output.
      clonedContent.querySelectorAll("[data-pdf-exclude='true']").forEach((node) => node.remove());
      clonedContent.querySelectorAll("button").forEach((node) => node.remove());

      const style = document.createElement("style");
      style.textContent = `
        [data-doc-pdf-root] * {
          box-sizing: border-box;
        }
        [data-doc-pdf-root] h2,
        [data-doc-pdf-root] h3,
        [data-doc-pdf-root] h4 {
          color: #19213D !important;
          break-after: avoid-page;
        }
        [data-doc-pdf-root] p,
        [data-doc-pdf-root] li,
        [data-doc-pdf-root] td,
        [data-doc-pdf-root] th {
          color: #6D758F !important;
          line-height: 1.65;
          font-size: 13px;
        }
        [data-doc-pdf-root] a {
          color: #149A9B !important;
          text-decoration: underline;
        }
        [data-doc-pdf-root] pre {
          background: #0f172a !important;
          color: #e2e8f0 !important;
          border-radius: 10px;
          padding: 14px;
          overflow: hidden;
          white-space: pre-wrap;
          word-break: break-word;
          box-shadow: none !important;
        }
        [data-doc-pdf-root] pre code,
        [data-doc-pdf-root] code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
        }
        [data-doc-pdf-root] table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 12px;
        }
        [data-doc-pdf-root] table th,
        [data-doc-pdf-root] table td {
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: left;
        }
        [data-doc-pdf-root] table th {
          background: #eef2ff;
          color: #19213D !important;
          font-weight: 700;
        }
        [data-doc-pdf-root] blockquote {
          border-left: 4px solid #149A9B;
          background: rgba(20, 154, 155, 0.07);
          border-radius: 8px;
          padding: 8px 12px;
          margin: 12px 0;
        }
      `;

      exportContainer.appendChild(style);
      exportContainer.appendChild(clonedContent);
      document.body.appendChild(exportContainer);

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: pdfFileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(exportContainer)
        .save();

      exportContainer.remove();
    } catch (error) {
      console.error("PDF export failed", error);
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-pdf-exclude="true">
      <button
        type="button"
        onClick={handleExportMarkdown}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors"
        style={{ borderColor: "#d1d5db", color: "#19213D", background: "#ffffff" }}
      >
        <FileCode2 size={15} />
        Export Markdown
      </button>

      <button
        type="button"
        onClick={handleExportJson}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors"
        style={{ borderColor: "#d1d5db", color: "#19213D", background: "#ffffff" }}
      >
        <FileJson size={15} />
        Export JSON
      </button>

      <button
        type="button"
        onClick={handleExportPdf}
        disabled={isExportingPdf}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ borderColor: "#149A9B", color: "#149A9B", background: "#ffffff" }}
      >
        {isExportingPdf ? <Download size={15} /> : <FileText size={15} />}
        {isExportingPdf ? "Generating PDF..." : "Export as PDF"}
      </button>

      <a
        href={`${DOCS_REPO_BASE}/${slug}.mdx`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors"
        style={{ borderColor: "#d1d5db", color: "#19213D", background: "#ffffff" }}
      >
        <Github size={15} />
        Edit on GitHub
      </a>
    </div>
  );
}
