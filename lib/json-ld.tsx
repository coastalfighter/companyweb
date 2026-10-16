/**
 * Serialize schema.org data for a <script type="application/ld+json"> tag.
 * `<` is escaped so a string can never close the script element
 * (Next.js JSON-LD guide).
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
