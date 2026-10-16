import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { cookiesContent } from "@/content/legal";
import { LEGAL_LAST_UPDATED } from "@/content/trust";

const content = cookiesContent();

export const metadata: Metadata = {
  title: content.title,
  description: "This site sets no cookies of its own. Every item it keeps in your browser, and why.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={content.title}
      intro={content.intro}
      lastUpdated={LEGAL_LAST_UPDATED}
      breadcrumb={[{ label: content.title, href: "/legal/cookies" }]}
      sections={content.sections}
    />
  );
}
