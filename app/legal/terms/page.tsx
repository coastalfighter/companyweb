import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { termsContent } from "@/content/legal";
import { LEGAL_LAST_UPDATED } from "@/content/trust";

const content = termsContent();

export const metadata: Metadata = {
  title: content.title,
  description: "The terms for using the Akrostech website.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={content.title}
      intro={content.intro}
      lastUpdated={LEGAL_LAST_UPDATED}
      breadcrumb={[{ label: content.title, href: "/legal/terms" }]}
      sections={content.sections}
    />
  );
}
