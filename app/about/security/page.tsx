import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { trustContent } from "@/content/legal";

export const metadata: Metadata = {
  title: "Security & trust",
  description:
    "How Akrostech protects client data: security practices, the DPA, sub-processors, and how to report a vulnerability.",
  alternates: { canonical: "/about/security" },
};

/** Trust Center (docs/blueprint/05-trust-credibility.md, E2.5). */
export default function SecurityPage() {
  const content = trustContent();
  return (
    <LegalDocument
      eyebrow="Trust center"
      title={content.title}
      intro={content.intro}
      breadcrumb={[
        { label: "About", href: "/about" },
        { label: "Security & trust", href: "/about/security" },
      ]}
      sections={content.sections}
    />
  );
}
