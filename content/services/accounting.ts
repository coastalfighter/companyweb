import { type ServiceContent } from "./types";

export const accounting: ServiceContent = {
  slug: "accounting",
  seo: {
    title: "Accounting Assistance",
    description:
      "Bookkeeping, month-end close, payroll, AP and AR, run by finance professionals inside your accounting system, with a close package by business day 5.",
  },
  hero: {
    eyebrow: "04 · Accounting",
    title: "Books closed by business day 5. Every month.",
    subtitle:
      "Bookkeeping, payroll, payables and receivables, run by finance professionals inside your accounting system. Your CFO gets clean numbers early enough to actually use them.",
    cta: "Book a finance scoping call",
  },
  metrics: [],
  scope: [
    {
      title: "Bookkeeping and reconciliations.",
      body: "Daily transaction coding, monthly bank and card recs, clean ledgers.",
    },
    {
      title: "Month-end close.",
      body: "A documented close checklist, accruals, prepaids, and a close package your CFO can review in an hour.",
    },
    {
      title: "Payroll operations.",
      body: "Multi-state payroll runs in Gusto, Rippling or ADP, plus new-hire setup and year-end forms.",
    },
    {
      title: "Accounts payable.",
      body: "Invoice capture, approval routing, payment runs, vendor statements.",
    },
    {
      title: "Accounts receivable.",
      body: "Invoicing, collections follow-up, cash application, aging reports.",
    },
    {
      title: "Audit and tax prep support.",
      body: "PBC lists, schedules and documentation organized for your CPA, so their bill goes down.",
    },
  ],
  limits: [
    "Audits, reviews or attestation (that's your CPA firm).",
    "Tax filing or tax advice.",
    "Sign-off on financial statements.",
    "Moving money without your documented approval workflow.",
  ],
  limitsNote:
    "Akrostech is not a licensed CPA firm. Audit, attestation and tax work stays with your CPA; we prepare everything they need.",
  timeline: {
    label: "Getting to a business-day-5 close",
    steps: [
      {
        when: "Week 1",
        title: "Diagnostic",
        body: "We review your chart of accounts, last 3 closes and open items. You get a cleanup estimate in writing.",
      },
      {
        when: "Weeks 2–3",
        title: "Cleanup (if needed)",
        body: "Catch-up bookkeeping and reconciliations to a clean starting balance.",
      },
      {
        when: "Week 4",
        title: "Parallel month",
        body: "We run the close alongside your team to prove the process.",
      },
      {
        when: "Month 2",
        title: "Ownership",
        body: "We own the close. You get the close package by business day 5.",
      },
      {
        when: "Ongoing",
        title: "Improve",
        body: "A monthly close review call and a quarterly process improvement list.",
      },
    ],
  },
  tools: [
    "QuickBooks Online",
    "Xero",
    "NetSuite",
    "Sage Intacct",
    "Bill.com",
    "Ramp",
    "Brex",
    "Expensify",
    "Gusto",
    "Rippling",
    "ADP",
    "Stripe",
    "Shopify",
    "Excel / Google Sheets",
  ],
  roles: [
    { title: "Finance Lead", detail: "Accounting degree, 8+ years. Owns your close and your numbers." },
    { title: "Senior Bookkeeper", detail: "Runs the close checklist day to day." },
    { title: "Payroll Specialist", detail: "Multi-state, multi-entity payroll." },
  ],
  slas: [
    ["Month-end close package", "By business day 5"],
    ["Payroll processing", "48 hours before pay date, every cycle"],
    ["AP payment runs", "Weekly, on your schedule"],
    ["Response to finance questions", "Within 4 business hours"],
    ["QA sampling", "10% of transactions monthly, reviewed by a second accountant"],
  ],
  proof: { caseStudy: null, testimonial: null },
  faqs: [
    {
      id: "software",
      question: "Do we need to switch accounting software?",
      answer: "No. We work in yours. If you're outgrowing it, we'll tell you and help you migrate.",
    },
    {
      id: "approvals",
      question: "Who approves payments?",
      answer: "You. We prepare payment runs; your designated approvers release them under dual control.",
    },
    {
      id: "accuracy",
      question: "How do you ensure accuracy?",
      answer:
        "Every month a second accountant samples 10% of transactions. Errors are logged, root-caused, and reported in your close package.",
    },
    {
      id: "entities",
      question: "Can you support multiple entities or currencies?",
      answer:
        "Yes, including intercompany eliminations and multi-currency revaluation in NetSuite, Xero and Intacct.",
    },
    {
      id: "backlog",
      question: "We have a messy backlog. Is that a problem?",
      answer:
        "Not at all; most clients start that way. We quote cleanup separately so you know the cost upfront.",
    },
  ],
  related: ["legal", "virtual-assistance"],
  slab: "Clean books by day 5. Then you can actually use them.",
};
