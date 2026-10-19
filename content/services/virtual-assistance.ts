import { type ServiceContent } from "./types";

export const virtualAssistance: ServiceContent = {
  slug: "virtual-assistance",
  seo: {
    title: "Virtual Assistance",
    description:
      "Inbox, calendar, CRM, vendors, travel and reporting, handled every day by a trained operator with a named backup and delegated access only.",
  },
  hero: {
    eyebrow: "03 · Virtual Assistance",
    title: "Your To-Do List. Handled.",
    subtitle: "Delegate the busywork. Keep the bandwidth.",
    cta: "Book a VA scoping call",
    secondary: { label: "View packages", href: "/pricing" },
  },
  metrics: [],
  scope: [
    {
      title: "Inbox management.",
      body: "Triage, draft, file, and flag only what needs you.",
    },
    {
      title: "Calendar ownership.",
      body: "Scheduling across time zones, prep docs attached to every meeting, buffers protected.",
    },
    {
      title: "CRM and data hygiene.",
      body: "Deduplicating HubSpot or Salesforce, updating deal stages, enriching records.",
    },
    {
      title: "Vendor and procurement admin.",
      body: "Chasing W-9s, collecting quotes, renewing subscriptions, tracking spend.",
    },
    {
      title: "Travel and events.",
      body: "Flights, hotels, visas and offsites, booked against your travel policy.",
    },
    {
      title: "Docs and reporting.",
      body: "Board decks formatted, weekly reports compiled, SOPs written and kept current.",
    },
  ],
  limits: [
    "Personal errands unrelated to the business.",
    "Tasks requiring physical presence.",
    "Anything that requires you to share a personal password (we use delegated access only).",
    "Unsupervised payments over your defined approval threshold.",
  ],
  timeline: {
    label: "Onboarding",
    steps: [
      {
        when: "Day 1",
        title: "Discovery",
        body: "We shadow your week through your calendar and inbox (with permission) and list everything you'd hand off.",
      },
      {
        when: "Days 2–3",
        title: "Playbook",
        body: "We write your personal SOP: preferences, VIPs, approval rules, tone of voice.",
      },
      {
        when: "Days 4–5",
        title: "Shadow mode",
        body: "Your assistant drafts; you approve. You see how they think.",
      },
      {
        when: "Week 2",
        title: "Full handoff",
        body: "Drafts become sends. A daily end-of-day summary lands in your channel.",
      },
      {
        when: "Day 30",
        title: "Review",
        body: "We adjust scope, add tasks, and lock in the rhythm.",
      },
    ],
  },
  tools: [
    "Google Workspace",
    "Microsoft 365",
    "Slack",
    "Teams",
    "Notion",
    "Asana",
    "Monday",
    "ClickUp",
    "HubSpot",
    "Salesforce",
    "Zoom",
    "Calendly",
    "Navan",
    "Expensify",
    "1Password",
  ],
  roles: [
    { title: "Executive Assistant", detail: "Supports C-suite. 5+ years." },
    { title: "Operations Assistant", detail: "CRM, vendors and reporting." },
    { title: "VA Team Lead", detail: "Reviews the work, covers absences and owns your SOP." },
  ],
  slas: [
    ["Request acknowledgment", "Within 1 business hour"],
    ["Standard task completion", "Same business day"],
    ["Coverage hours", "Your business hours, at least 8 hours' overlap"],
    ["Backup coverage", "Named backup trained on your SOP"],
    ["Daily summary", "End of your day"],
  ],
  proof: { caseStudy: null, testimonial: null },
  faqs: [
    {
      id: "team",
      question: "Is it one person or a team?",
      answer:
        "A dedicated primary assistant, backed by a team lead and a trained backup. You get continuity without the single point of failure.",
    },
    {
      id: "access",
      question: "How do you keep access secure?",
      answer:
        "Delegated access only (Google or Microsoft delegation, shared vaults). No passwords in chat. Access is logged and revocable instantly.",
    },
    {
      id: "timezone",
      question: "What time zone do they work in?",
      answer: "Yours. We guarantee at least 8 hours of overlap with your core business hours.",
    },
    {
      id: "several",
      question: "Can one assistant support several people?",
      answer: "Yes. Most of our assistants support 2–4 people on the same team.",
    },
    {
      id: "part-time",
      question: "What if I don't have enough work for full-time?",
      answer: "Start on a pooled plan from 40 hours a month and scale up.",
    },
  ],
  related: ["recruitment", "accounting"],
  slab: "Get your Tuesdays back.",
};
