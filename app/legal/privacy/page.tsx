import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { privacyContent } from "@/content/legal";
import { LEGAL_LAST_UPDATED } from "@/content/trust";

const content = privacyContent();

export const metadata: Metadata = {
  title: content.title,
  description: "What this website collects, why, who sees it, how long we keep it, and your rights.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title={content.title}
      intro={content.intro}
      lastUpdated={LEGAL_LAST_UPDATED}
      breadcrumb={[{ label: content.title, href: "/legal/privacy" }]}
      sections={content.sections}
    />
  );
}
