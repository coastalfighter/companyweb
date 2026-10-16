import { type ServiceContent } from "./types";

export const webDevelopment: ServiceContent = {
  slug: "web-development",
  seo: {
    title: "Web Development",
    description:
      "Fast, accessible websites on Next.js, Webflow or WordPress, designed, built and maintained by a senior team that ships weekly and never holds your code hostage.",
  },
  hero: {
    eyebrow: "01 · Web Development",
    title: "Websites built like products, not brochures.",
    subtitle:
      "We design, build and maintain fast, accessible sites on Next.js, Webflow or WordPress. You get a senior team that ships weekly and never holds your code hostage.",
    cta: "Book a web scoping call",
  },
  metrics: [],
  scope: [
    {
      title: "Rebuilds from zero.",
      body: "Strategy, IA, design and build, launched in 6–10 weeks with redirects mapped so you keep your rankings.",
    },
    {
      title: "Platform migrations.",
      body: "WordPress to Next.js or Webflow, Squarespace to anything. Content moved, URLs preserved.",
    },
    {
      title: "Performance and Core Web Vitals.",
      body: "We find what's slowing you down and fix it, with before/after measurements.",
    },
    {
      title: "Accessibility remediation.",
      body: "WCAG 2.1 AA audits and fixes, with a written conformance report your legal team can file.",
    },
    {
      title: "Care plans.",
      body: "Updates, security patches, uptime monitoring, and a monthly bank of change requests.",
    },
    {
      title: "Landing pages on demand.",
      body: "Campaign pages built in 3 business days from brief to live, A/B-ready.",
    },
  ],
  limits: [
    "Native mobile apps.",
    "Custom SaaS products or complex back-end platforms (we'll refer you to partners who do).",
    "Paid ads management.",
    "“Quick fixes” on hacked sites without a security review first.",
  ],
  timeline: {
    label: "A typical rebuild",
    steps: [
      {
        when: "Week 0",
        title: "Audit",
        body: "Analytics, Search Console, Core Web Vitals, content inventory. You get a 6-page audit, free, whether or not you proceed.",
      },
      {
        when: "Weeks 1–2",
        title: "Architecture + design",
        body: "Sitemap, wireframes and a design system in Figma. Two rounds of revisions included.",
      },
      {
        when: "Weeks 3–6",
        title: "Build",
        body: "Staging links every Friday. You review real pages, not screenshots.",
      },
      {
        when: "Week 7",
        title: "QA + launch",
        body: "Cross-browser, accessibility and performance checks. Launch on a Tuesday morning, never on a Friday.",
      },
      {
        when: "Week 8 onward",
        title: "Care",
        body: "30 days of hypercare included, then an optional care plan.",
      },
    ],
  },
  tools: [
    "Next.js",
    "React",
    "Webflow",
    "WordPress",
    "Sanity",
    "Contentful",
    "Vercel",
    "Netlify",
    "Cloudflare",
    "Figma",
    "GitHub",
    "Google Analytics 4",
    "Search Console",
    "HubSpot",
  ],
  roles: [
    { title: "Web Lead", detail: "8+ years. Owns delivery and is your single point of contact." },
    { title: "Senior Front-End Engineer", detail: "Performance and accessibility specialist." },
    { title: "Product Designer", detail: "Systems-first. Works in Figma with you, live." },
  ],
  slas: [
    ["Critical outage response", "30 minutes, 24/7"],
    ["Standard change request", "1 business day"],
    ["Staging preview cadence", "Weekly (Fridays)"],
    ["Uptime monitoring", "1-minute checks, alerts to your channel"],
    ["Security patches", "Within 72 hours of release"],
  ],
  proof: { caseStudy: null, testimonial: null },
  faqs: [
    {
      id: "code",
      question: "Who owns the code?",
      answer:
        "You do. Repositories live in your GitHub organization from day one; hosting and domains are in your accounts.",
    },
    {
      id: "in-house",
      question: "Can you work with our in-house engineers?",
      answer:
        "Yes. We follow your PR process, branch rules and code review. Many clients use us so their engineers can stay on product.",
    },
    {
      id: "copy",
      question: "Do you write the copy?",
      answer:
        "We can, through our content partner, or we work with your team's copy. Either way, we write the microcopy: buttons, forms, errors.",
    },
    {
      id: "hacked",
      question: "Our current site was hacked. Can you help?",
      answer:
        "Yes. We do a security review first, clean up or rebuild, then set up monitoring and hardened hosting so it doesn't happen again.",
    },
    // "What does a rebuild cost?" ($18K–$60K in the blueprint) is held back until the range is confirmed.
  ],
  related: ["virtual-assistance", "legal"],
  slab: "Your website is your best salesperson. Let's make it a fast one.",
};
