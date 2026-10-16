/**
 * SAMPLE DATA FOR DESIGN REVIEW ONLY. Fabricated (docs/blueprint, [SAMPLE] tags).
 * Rendered exclusively on /design-system/home-preview, under a "Sample data"
 * banner. Never import this from a public page.
 */
import { type CaseStudy } from "./case-studies";
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

/** Case studies for design review (blueprint 10C and the homepage sample quotes). All fictional. */
export const sampleCaseStudies: readonly CaseStudy[] = [
  {
    slug: "tidemark-health",
    client: "Tidemark Health",
    services: ["accounting", "virtual-assistance"],
    industry: "Healthcare",
    title: "How Tidemark Health cut month-end close from 15 days to 5.",
    oneLiner:
      "A 380-person multi-site clinic group was growing faster than its finance team. We rebuilt the close, took over payables, and gave leadership their numbers while they still mattered.",
    stats: [
      { value: "15 → 5", label: "days to close" },
      { value: "$212K", label: "saved per year" },
      { value: "0", label: "audit adjustments" },
    ],
    snapshot: {
      size: "380 employees, 7 locations, $64M revenue",
      team: "Finance Lead, 2 Senior Bookkeepers, 1 Executive Assistant",
      duration: "18 months, ongoing",
      tools: ["NetSuite", "Bill.com", "Ramp", "Rippling", "Slack"],
    },
    situation: [
      "When Tidemark's CFO, Dana Whitfield, joined in early 2025, the monthly close took 15 business days. The finance team of three was coding 4,000 transactions a month by hand across seven locations, and payables ran on a shared inbox. Board packages arrived the week before the next month ended, which meant leadership was always steering by a month-old map.",
      "Hiring two more accountants would have cost about $260,000 a year fully loaded, and taken a quarter to fill. Dana needed the capacity in weeks, and she needed it auditable.",
    ],
    approach: [
      {
        title: "Diagnostic (week 1).",
        body: "We reviewed the last three closes and found 61% of close time went to reconciliations that could be daily, not monthly.",
      },
      {
        title: "Cleanup (weeks 2–3).",
        body: "We reconciled 14 months of intercompany balances and cleared 312 aged items.",
      },
      {
        title: "A documented close.",
        body: "We wrote a 46-step close checklist with owners and deadlines, run in NetSuite with task tracking visible to Dana's team.",
      },
      {
        title: "AP takeover.",
        body: "We moved payables from a shared inbox into Bill.com with approval routing by location manager. Vendor queries dropped by 70%.",
      },
      {
        title: "Executive support.",
        body: "An Akrostech EA took over board-package assembly and the CFO's calendar, returning about 9 hours a week to Dana.",
      },
    ],
    results: [
      { label: "Close time", before: "15 days", after: "5 days" },
      { label: "Annual cost", before: "$260K", after: "$48K", note: "net of Akrostech fees: $212K saved" },
      { label: "AP processing time", after: "−64%" },
      { label: "External audit adjustments", after: "0", note: "first time in 4 years" },
    ],
    quote: {
      text: "I expected to spend the first three months managing a vendor. Instead I got my first business-day-5 close in month two, and a report every Friday that I actually read.",
      name: "Dana Whitfield",
      title: "CFO, Tidemark Health",
    },
    whatsNext:
      "Tidemark has since added Recruitment Assistance for its clinical admin roles, and we're supporting its migration to a multi-subsidiary NetSuite setup ahead of two acquisitions.",
    publishedAt: "2026-09-01",
    permission: "sample",
  },
  {
    slug: "bramblecrest-analytics",
    client: "Bramblecrest Analytics",
    services: ["web-development", "recruitment"],
    industry: "SaaS",
    title: "How Bramblecrest shipped a new site in six weeks and filled three backend roles.",
    oneLiner:
      "A Series C analytics company needed a faster marketing site and senior engineers, without pulling anyone off the product.",
    stats: [
      { value: "6", label: "weeks to launch" },
      { value: "0.8s", label: "median LCP" },
      { value: "3", label: "roles filled" },
    ],
    snapshot: {
      size: "220 employees, Series C",
      team: "Web Lead, 2 Engineers, 1 Recruiter",
      duration: "9 months, ongoing",
      tools: ["Next.js", "Sanity", "Vercel", "Greenhouse", "Linear"],
    },
    situation: [
      "Bramblecrest's site was a three-year-old theme that took four seconds to load, and every change waited on the product team. Three backend roles had been open since spring.",
    ],
    approach: [
      { title: "Rebuild.", body: "A Next.js and Sanity rebuild, shipped in weekly increments." },
      { title: "Hiring.", body: "A dedicated recruiter ran sourcing and screening inside Greenhouse." },
    ],
    results: [
      { label: "Largest Contentful Paint", before: "4.1s", after: "0.8s" },
      { label: "Demo requests", after: "+38%" },
      { label: "Time to fill", before: "5 months", after: "7 weeks" },
    ],
    quote: {
      text: "Our team never had to chase them for an update, not once.",
      name: "Marcus Oyelaran",
      title: "CTO, Bramblecrest Analytics",
    },
    whatsNext: "We now run Bramblecrest's site on a care plan and support two more engineering searches.",
    publishedAt: "2026-07-15",
    permission: "sample",
  },
  {
    slug: "larkspur-freight",
    client: "Larkspur Freight",
    services: ["legal", "virtual-assistance"],
    industry: "Logistics",
    title: "How Larkspur Freight caught 23 renewals before they auto-renewed.",
    oneLiner: "1,200 contracts in a shared drive became a searchable register with every date on a calendar.",
    stats: [
      { value: "1,200", label: "contracts registered" },
      { value: "23", label: "renewals caught" },
    ],
    snapshot: {
      size: "$140M revenue",
      team: "Legal Ops Lead, 1 Contract Analyst",
      duration: "6 months",
      tools: ["Ironclad", "Google Drive", "Slack"],
    },
    situation: ["Contracts lived in a shared drive with no owners or dates."],
    approach: [
      { title: "Register.", body: "Every contract abstracted into Ironclad with owners and key dates." },
    ],
    results: [
      { label: "Contracts with a named owner", before: "0%", after: "100%" },
      { label: "Unwanted renewals", after: "23 avoided" },
      { label: "Time to find a contract", before: "Days", after: "Seconds" },
    ],
    quote: null,
    whatsNext: "Larkspur's general counsel now gets a monthly renewal calendar from us.",
    publishedAt: "2026-05-20",
    permission: "sample",
  },
];
