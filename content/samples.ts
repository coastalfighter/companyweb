/**
 * SAMPLE DATA FOR DESIGN REVIEW ONLY. Fabricated (docs/blueprint, [SAMPLE] tags).
 * Rendered exclusively on /design-system/home-preview, under a "Sample data"
 * banner. Never import this from a public page.
 */
import { type CompanyFacts } from "./company";
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

/** About page facts for design review (blueprint 8.2–8.6, all [VERIFY]). */
export const sampleCompany: CompanyFacts = {
  originStory: [
    "Akrostech began in 2019 with our founder running operations for a fast-growing logistics company. The pattern was always the same: brilliant people buried in admin, and outsourcing partners who were cheap until they were expensive.",
    "So we set three rules that still run the company today:",
  ],
  originToday:
    "Today we're 140 specialists across 4 countries, running back offices for companies from 40-person startups to 2,000-person enterprises.",
  numbers: [
    { value: "140", label: "specialists", source: "sample" },
    { value: "4", label: "countries", source: "sample" },
    { value: "86", label: "clients", source: "sample" },
    { value: "2019", label: "founded", source: "sample" },
  ],
  leadership: [
    {
      name: "Sample Founder",
      role: "Founder & CEO",
      background: "Ran operations at a logistics scale-up through 4× growth.",
      previously: ["Sample Freight Co.", "Sample Consulting"],
    },
    {
      name: "Sample Operator",
      role: "Head of Delivery",
      background: "Built shared-services teams for three mid-market companies.",
      previously: ["Sample Health", "Sample Bank"],
    },
    {
      name: "Sample Controller",
      role: "Head of Finance Operations",
      background: "Former audit senior; has run more than 400 month-end closes.",
      previously: ["Sample Audit LLP"],
    },
    {
      name: "Sample Counsel",
      role: "Head of Legal Operations",
      background: "Contract manager for a 2,000-person SaaS company.",
      previously: ["Sample Software Inc."],
    },
  ],
  hubs: [
    { city: "Manila", timeZone: "Asia/Manila", lat: 14.6, lon: 121 },
    { city: "Bogotá", timeZone: "America/Bogota", lat: 4.7, lon: -74.1 },
    { city: "Kraków", timeZone: "Europe/Warsaw", lat: 50.1, lon: 19.9 },
  ],
};
