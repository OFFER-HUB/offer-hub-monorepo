import React from "react";

export interface PRCardProps {
  title: string;
  author: string;
  authorAvatar: string;
  mergedAt: string | Date;
  url: string;
  labels: string[];
}

function formatMergedAt(mergedAt: string | Date): { label: string; iso?: string } {
  if (mergedAt instanceof Date) {
    return {
      label: mergedAt.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      iso: mergedAt.toISOString(),
    };
  }

  const parsed = new Date(mergedAt);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      label: parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      iso: parsed.toISOString(),
    };
  }

  return { label: mergedAt };
}

export default function PRCard({
  title,
  author,
  authorAvatar,
  mergedAt,
  url,
  labels,
}: PRCardProps) {
  const mergedDate = formatMergedAt(mergedAt);

  return (
    <article
      className="rounded-2xl p-5 shadow-raised h-full transition-shadow duration-300 hover:shadow-raised-hover"
      style={{ background: "#F1F3F7" }}
    >
      <div className="flex items-start justify-between gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold leading-snug transition-colors duration-200 hover:text-[#149A9B] 
          text-[#19213D] dark:text-[#b8bfd0]"
        >
          {title}
        </a>
        <span
          className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: "rgba(20,154,155,0.12)", color: "#149A9B" }}
        >
          Merged
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <img
          src={authorAvatar}
          alt={`${author} avatar`}
          className="h-7 w-7 rounded-full object-cover shadow-raised-sm"
          loading="lazy"
        />
        <p className="text-xs" style={{ color: "#6D758F" }}>
          {author}
        </p>
        <span className="text-xs" style={{ color: "#6D758F" }}>
          •
        </span>
        <time
          className="text-xs"
          style={{ color: "#6D758F" }}
          dateTime={mergedDate.iso}
        >
          {mergedDate.label}
        </time>
      </div>

      {labels.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {labels.map((label) => (
            <span
              key={label}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium shadow-raised-sm"
              style={{ color: "#6D758F", border: "1px solid #d1d5db" }}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export const MOCK_PR_CARD_PROPS: PRCardProps = {
  title: "feat: add PR card component with merged status support",
  author: "octocat",
  authorAvatar: "https://avatars.githubusercontent.com/u/583231?v=4",
  mergedAt: "2026-02-20T13:24:00.000Z",
  url: "https://github.com/OFFER-HUB/offer-hub-monorepo/pull/1016",
  labels: ["enhancement", "frontend", "community"],
};

export function PRCardMockPreview() {
  return <PRCard {...MOCK_PR_CARD_PROPS} />;
}
