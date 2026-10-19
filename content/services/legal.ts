import { type ServiceContent } from "./types";

/**
 * COMPLIANCE: Akrostech must not imply it provides legal advice or representation.
 * Every line positions the team as legal operations support working under the
 * direction of the client's licensed attorneys. Counsel must review this file for
 * unauthorized-practice-of-law risk in every jurisdiction served before launch.
 */
export const legal: ServiceContent = {
  slug: "legal",
  seo: {
    title: "Legal Assistance",
    description:
      "Legal operations support under your counsel's direction: contract intake, first-pass redlines against your playbook, CLM administration, NDAs and compliance calendars. Akrostech is not a law firm.",
  },
  hero: {
    eyebrow: "05 · Legal Assistance",
    title: "Compliant. Protected. Moving.",
    subtitle: "Contracts, compliance, and legal ops, handled in the background.",
    cta: "Book a legal ops scoping call",
    secondary: { label: "Our legal stack", href: "#tools-title" },
    note: "Run under the direction of your counsel. Akrostech is not a law firm and does not provide legal advice.",
  },
  metrics: [],
  scope: [
    {
      title: "Contract intake and triage.",
      body: "A single request channel. Every contract logged, categorized and routed to the right attorney.",
    },
    {
      title: "First-pass redlines against your playbook.",
      body: "We mark up third-party paper against your approved fallback positions, so your counsel reviews instead of drafting.",
    },
    {
      title: "CLM administration.",
      body: "Setup and upkeep of Ironclad, Juro, DocuSign CLM, or a well-built spreadsheet if that's what you need.",
    },
    {
      title: "NDAs and standard agreements.",
      body: "Your templates, filled, sent and executed, typically within 24 hours.",
    },
    {
      title: "Obligation and renewal tracking.",
      body: "Key dates, notice periods and obligations extracted and calendared.",
    },
    {
      title: "Compliance calendars.",
      body: "Annual filings, registered agent renewals, license and policy-review deadlines tracked across entities.",
    },
  ],
  limits: [
    "Provide legal advice or opinions.",
    "Represent you in any matter.",
    "Approve non-standard terms (your counsel decides).",
    "Litigation support beyond document organization.",
  ],
  limitsNote:
    "Akrostech is not a law firm and does not provide legal advice. Our team works under the direction of your licensed attorneys.",
  timeline: {
    label: "Standing up legal operations",
    steps: [
      {
        when: "Week 1",
        title: "Inventory",
        body: "We collect your executed agreements and templates and build a contract register.",
      },
      {
        when: "Week 2",
        title: "Playbook",
        body: "With your counsel, we document standard positions, fallbacks and escalation rules.",
      },
      {
        when: "Week 3",
        title: "Pilot",
        body: "We run NDAs and low-risk agreements end to end; counsel reviews every output.",
      },
      {
        when: "Week 4 onward",
        title: "Scale",
        body: "We add commercial agreements and renewals. Counsel reviews by exception.",
      },
      {
        when: "Quarterly",
        title: "Playbook review",
        body: "What's escalating most, and which positions to update.",
      },
    ],
  },
  tools: [
    "Ironclad",
    "Juro",
    "DocuSign",
    "DocuSign CLM",
    "PandaDoc",
    "Adobe Sign",
    "Microsoft Word",
    "SharePoint",
    "Google Drive",
    "Notion",
    "Salesforce",
    "HubSpot",
    "Carta",
  ],
  roles: [
    {
      title: "Legal Operations Lead",
      detail: "JD or paralegal certification, 7+ years in in-house legal ops.",
    },
    { title: "Contract Specialist", detail: "First-pass redlines against your playbook." },
    { title: "Compliance Coordinator", detail: "Calendars, filings and entity records." },
  ],
  slas: [
    ["NDA turnaround", "Within 24 business hours"],
    ["First-pass redline", "Within 3 business days"],
    ["Renewal alerts", "At least 60 days before the notice deadline"],
    ["Contract register updated", "Within 1 business day of execution"],
    ["Escalation to counsel", "Same day for non-standard terms"],
  ],
  proof: { caseStudy: null, testimonial: null },
  faqs: [
    {
      id: "law-firm",
      question: "Are you a law firm?",
      answer:
        "No. We're a legal operations team. We work under your attorneys' direction and never give legal advice.",
    },
    {
      id: "no-counsel",
      question: "We don't have in-house counsel. Can we still use you?",
      answer:
        "Yes, alongside your outside counsel. We make their time more efficient, which usually lowers your bill.",
    },
    {
      id: "privilege",
      question: "How do you handle confidentiality and privilege?",
      answer:
        "We work under NDA and your counsel's instructions, within your systems, to help preserve privilege. Your counsel should advise on privilege specifics.",
    },
    {
      id: "clm",
      question: "Do you work with our existing CLM?",
      answer:
        "Yes. If you don't have one, we'll help you pick and implement one, or run a disciplined spreadsheet register until you need more.",
    },
    {
      id: "types",
      question: "What types of contracts do you handle?",
      answer:
        "NDAs, MSAs, SOWs, DPAs, vendor and customer agreements, employment offer letters (with HR) and leases.",
    },
  ],
  related: ["accounting", "virtual-assistance"],
  slab: "Never miss a renewal date again.",
};
