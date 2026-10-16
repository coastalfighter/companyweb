/**
 * SAMPLE DATA FOR DESIGN REVIEW ONLY. Fabricated (docs/blueprint, [SAMPLE] tags).
 * Rendered exclusively on /design-system/home-preview, under a "Sample data"
 * banner. Never import this from a public page.
 */
import { type Proof } from "./proof";

export const sampleProof: Proof = {
  logoBarLabel: "Trusted by operators at 140+ companies in 11 countries",
  clientLogos: Array.from({ length: 10 }, (_, i) => ({
    name: `Sample client ${i + 1}`,
    src: "",
    aspect: [3.2, 2.4, 4, 2.8, 3.6, 2.2, 3, 4.2, 2.6, 3.4][i]!,
    permission: "sample",
  })),
  stats: [
    { value: "96", unit: "%", label: "client retention after year one", source: "sample" },
    { value: "3h 41", unit: "m", label: "median task turnaround", source: "sample" },
    { value: "10", unit: " days", label: "average time to first delivery", source: "sample" },
    { value: "0", label: "data incidents since 2019", source: "sample" },
  ],
  statsFootnote: "Figures from Akrostech client data, Jan–Sep 2026.",
  testimonials: [
    {
      quote:
        "I expected to spend the first three months managing a vendor. Instead I got my first business-day-5 close in month two, and a report every Friday that I actually read.",
      name: "Dana Whitfield",
      title: "CFO",
      company: "Tidemark Health",
      context: "Healthcare services · 380 employees",
      services: ["Accounting", "Virtual Assistance"],
      permission: "sample",
    },
    {
      quote:
        "They rebuilt our marketing site in six weeks without pulling a single engineer off the product. Then they filled three backend roles we'd had open since spring. Our team never had to chase them for an update, not once.",
      name: "Marcus Oyelaran",
      title: "CTO",
      company: "Bramblecrest Analytics",
      context: "B2B SaaS · Series C · 220 employees",
      services: ["Web Development", "Recruitment"],
      permission: "sample",
    },
    {
      quote:
        "We had 1,200 contracts in a shared drive and no idea what auto-renewed when. Akrostech built the register in six weeks and caught 23 renewals we would have paid for.",
      name: "Priya Raman",
      title: "COO",
      company: "Larkspur Freight",
      context: "Logistics · $140M revenue",
      services: ["Legal Assistance", "Virtual Assistance"],
      permission: "sample",
    },
  ],
  featuredCaseStudy: {
    eyebrow: "Case study · Accounting + Virtual Assistance",
    title: "How Tidemark Health cut month-end close from 15 days to 5.",
    results: ["15 → 5 days close", "$212K saved / year", "0 audit findings"],
    href: "/work/tidemark-health",
  },
  certifications: { soc2Type2: true, iso27001: true },
};
