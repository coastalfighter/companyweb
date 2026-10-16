"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface CaseStudyNavProps {
  sections: readonly { id: string; label: string }[];
}

/**
 * Snapshot sidebar scrollspy (blueprint 10B): highlights the section being read.
 * The section counts as "being read" once its top crosses 30% of the viewport.
 * Without JS it is a plain list of anchor links.
 */
export function CaseStudyNav({ sections }: CaseStudyNavProps) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // The first section (in document order) inside the reading band wins.
        const first = elements.find((el) => visible.has(el.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page">
      <ol className="flex flex-col border-l border-line">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-4 text-body-sm transition-colors",
                active === section.id
                  ? "border-fg font-medium text-fg"
                  : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
