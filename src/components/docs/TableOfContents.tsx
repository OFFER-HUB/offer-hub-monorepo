"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/mdx";
import { cn } from "@/lib/cn";

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length > 0) {
          const isAtBottom =
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

          if (isAtBottom) {
            setActiveId(visibleEntries[visibleEntries.length - 1].target.id);
          } else {
            setActiveId(visibleEntries[0].target.id);
          }
        }
      },
      {
        rootMargin: "-100px 0px -40% 0px",
        threshold: [0, 1],
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const isAtBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
        if (isAtBottom && headings.length > 0) {
          setActiveId(headings[headings.length - 1].id);
        }
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(scrollTimeout);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="w-full">
      <div className="flex flex-col">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-6 px-4 text-[#6D758F]/60">
          On this page
        </p>
        <ul className="flex flex-col gap-1">
          {headings.map((heading, index) => (
            <li
              key={`${heading.id}-${index}`}
              className={heading.level === 3 ? "ml-4" : ""}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={cn(
                  "text-[13px] transition-all duration-200 block py-1.5 px-4 rounded-lg font-medium",
                  activeId === heading.id
                    ? "text-[#149A9B] bg-[#149A9B]/5"
                    : "text-[#6D758F] hover:text-[#19213D] hover:bg-[#19213D]/5"
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
