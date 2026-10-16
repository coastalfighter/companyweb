import { type ReactNode } from "react";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";
import { Eyebrow } from "@/components/ui/eyebrow";

export type LegalBlock =
  | { kind: "p"; text: ReactNode }
  | { kind: "list"; items: ReactNode[] }
  | { kind: "table"; caption: string; head: string[]; rows: ReactNode[][] };

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  /** ISO date. */
  lastUpdated?: string;
  breadcrumb: Crumb[];
  sections: LegalSection[];
  /** Rendered after the sections (e.g. a call to action). */
  footer?: ReactNode;
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "list":
      return (
        <ul className="flex list-disc flex-col gap-2 pl-6">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div
          // Scrollable on narrow screens, so it must be reachable by keyboard (axe: scrollable-region-focusable).
          tabIndex={0}
          role="region"
          aria-label={block.caption}
          className="overflow-x-auto rounded-lg border border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <table className="w-full min-w-[520px] text-left text-body-sm">
            <caption className="sr-only">{block.caption}</caption>
            <thead className="bg-surface-2 text-fg">
              <tr>
                {block.head.map((h) => (
                  <th key={h} scope="col" className="p-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className={j === 0 ? "p-3 font-medium text-fg" : "p-3"}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/**
 * Long-form legal and trust pages: dark title band, then the Paper theme for
 * reading (blueprint A1.7), a contents list, and a "last updated" date.
 */
export function LegalDocument({
  eyebrow,
  title,
  intro,
  lastUpdated,
  breadcrumb,
  sections,
  footer,
}: LegalDocumentProps) {
  return (
    <article aria-labelledby="legal-title">
      <header className="pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
          <Breadcrumb items={breadcrumb} />
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 id="legal-title" className="max-w-[22ch] font-display text-h1 font-semibold text-fg">
            {title}
          </h1>
          <div className="max-w-[62ch] text-body-lg text-fg-muted">{intro}</div>
          {lastUpdated ? (
            <p className="text-caption text-fg-muted">
              Last updated{" "}
              <time dateTime={lastUpdated}>{dateFormat.format(new Date(`${lastUpdated}T00:00:00Z`))}</time>
            </p>
          ) : null}
        </div>
      </header>
      <div className="theme-paper bg-bg text-fg">
        <div className="mx-auto grid max-w-(--container-content) gap-10 px-(--gutter) py-16 md:py-20 lg:grid-cols-12 lg:gap-8">
          <nav aria-label="Contents" className="lg:col-span-3">
            <ol className="flex flex-col gap-1.5 text-body-sm lg:sticky lg:top-28">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="flex min-w-0 flex-col gap-12 lg:col-span-8 lg:col-start-5">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-28"
              >
                <h2 id={`${section.id}-title`} className="font-display text-h4 font-semibold text-fg">
                  {section.heading}
                </h2>
                <div className="mt-4 flex max-w-(--container-prose) flex-col gap-4 text-body text-fg-muted [&_a]:text-fg [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-medium [&_strong]:text-fg">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </div>
              </section>
            ))}
            {footer}
          </div>
        </div>
      </div>
    </article>
  );
}
