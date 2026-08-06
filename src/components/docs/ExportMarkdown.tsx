"use client";

import { Download } from 'lucide-react';
import { logger } from '@/utils/logger';

interface ExportMarkdownProps {
    slug: string;
}

export function ExportMarkdown({ slug }: ExportMarkdownProps) {
    function handleExport() {
        const el = document.getElementById("doc-metadata-for-actions");
        if (!el) {
            logger.error("Documentation metadata not found");
            return;
        }

        const markdown = el.getAttribute("data-markdown");
        if (!markdown) {
            logger.error("Documentation content not found");
            return;
        }

        const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${slug.replace(/\//g, "-")}.md`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    return (
        <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-[#149A9B] transition-colors"
        >
            <Download size={14} />
            <span>Export Markdown</span>
        </button>
    );
}