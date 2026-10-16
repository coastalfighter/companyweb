import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { dpaContent } from "@/content/legal";
import { LEGAL_LAST_UPDATED } from "@/content/trust";

const content = dpaContent();

export const metadata: Metadata = {
  title: content.title,
  description: "The Data Processing Addendum we sign before handling any personal data for a client.",
  alternates: { canonical: "/legal/dpa" },
};

export default function DpaPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={content.title}
      intro={content.intro}
      lastUpdated={LEGAL_LAST_UPDATED}
      breadcrumb={[{ label: content.title, href: "/legal/dpa" }]}
      sections={content.sections}
    />
  );
}
