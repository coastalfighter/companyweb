import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { accessibilityContent } from "@/content/legal";
import { LEGAL_LAST_UPDATED } from "@/content/trust";

const content = accessibilityContent();

export const metadata: Metadata = {
  title: content.title,
  description:
    "Our accessibility standard (WCAG 2.1 AA), how we test it, known limitations, and how to tell us about a problem.",
  alternates: { canonical: "/legal/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={content.title}
      intro={content.intro}
      lastUpdated={LEGAL_LAST_UPDATED}
      breadcrumb={[{ label: content.title, href: "/legal/accessibility" }]}
      sections={content.sections}
    />
  );
}
