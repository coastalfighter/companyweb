export interface RailSection {
  /** The id of the section's heading; the section is found by `aria-labelledby`. */
  id: string;
  /** Short label for the "On this page" nav. */
  label: string;
}

/** Ids end up inside a CSS selector and a custom ident, so only plain slugs are accepted. */
const SAFE_ID = /^[a-z][a-z0-9-]*$/;

/** The scroll timeline name for the section at `index`. */
export function railTimeline(index: number): string {
  return `--rail-${index}`;
}

/** The CSS that names each section's view timeline and hoists the names to the root. */
export function railStyles(sections: readonly RailSection[]): string {
  if (sections.length === 0) return "";
  const names = sections.map((_, i) => railTimeline(i));
  const rules = sections.map(
    (s, i) => `section[aria-labelledby="${s.id}"]{view-timeline-name:${railTimeline(i)}}`,
  );
  return `:root{timeline-scope:${names.join(",")}}${rules.join("")}`;
}

/**
 * The scroll rail (docs/blueprint/01-brand-design-system.md, A6.3a): a fixed rail on
 * the right edge with one segment per section. Each segment fills while you read its
 * section, and the lit tip is a "task packet" moving down the pipeline. Pure CSS
 * scroll-driven animation, so it costs no JavaScript; browsers without scroll
 * timelines, small screens and reduced motion don't show it.
 */
export function ScrollRail({ sections }: { sections: readonly RailSection[] }) {
  const valid = sections.filter((s) => SAFE_ID.test(s.id));
  if (valid.length === 0) return null;

  return (
    <>
      <style>{railStyles(valid)}</style>
      <nav aria-label="On this page" className="scroll-rail">
        <ol className="scroll-rail-list">
          {valid.map((section, i) => (
            <li
              key={section.id}
              className="scroll-rail-item"
              style={{ "--rail-timeline": railTimeline(i) } as React.CSSProperties}
            >
              <a href={`#${section.id}`} className="scroll-rail-link">
                <span aria-hidden className="scroll-rail-tick" />
                <span className="scroll-rail-label">{section.label}</span>
              </a>
              <span aria-hidden className="scroll-rail-segment">
                <span className="scroll-rail-fill" />
                <span className="scroll-rail-packet" />
              </span>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
