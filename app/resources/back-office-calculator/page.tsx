import type { Metadata } from "next";
import { CalculatorIsland } from "@/components/calculator/calculator-island";
import { Eyebrow } from "@/components/ui/eyebrow";
import { rateCard } from "@/content/rate-card";
import { JsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Back-office cost calculator",
  description:
    "Work out what finance, hiring, admin, web and legal-ops work costs your team today, and how many senior hours you'd get back. Every assumption shown.",
  alternates: { canonical: "/resources/back-office-calculator" },
};

/** The Back-Office Cost Calculator (docs/blueprint/06-cta-conversion.md, F4). */
export default function CalculatorPage() {
  return (
    <>
      <JsonLd
        data={{
          "@type": "WebApplication",
          name: `${siteConfig.name} back-office cost calculator`,
          url: `${siteConfig.url}/resources/back-office-calculator`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <section aria-labelledby="calculator-title" className="pt-28 pb-(--section-y) md:pt-36">
        <div className="mx-auto flex max-w-(--container-content) flex-col gap-12 px-(--gutter)">
          <div className="flex max-w-3xl flex-col gap-6">
            <Eyebrow>Back-office cost calculator</Eyebrow>
            <h1 id="calculator-title" className="font-display text-h1 font-semibold text-fg">
              Write the business case in two minutes.
            </h1>
            <p className="max-w-[58ch] text-body-lg text-fg-muted">
              Tell us who does the work today and how long it takes. You&apos;ll see what it costs, the senior
              hours you&apos;d get back, and the math behind every number. No email needed.
            </p>
          </div>
          <CalculatorIsland rateCard={rateCard} contactHref="/contact" />
        </div>
      </section>
    </>
  );
}
