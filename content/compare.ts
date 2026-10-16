import { type FaqItem } from "./faq";

/**
 * The comparison data (docs/blueprint/03-page-blueprints.md, 1.9), shared by the
 * homepage table and the /compare pages so they can never disagree. Akrostech's
 * column states commitments listed in README "Claims to confirm".
 */

export const COMPETITORS = ["freelancers", "bpo", "in-house"] as const;
export type Competitor = (typeof COMPETITORS)[number];

export const COMPETITOR_LABELS: Record<Competitor, string> = {
  freelancers: "Freelancers",
  bpo: "Typical offshore BPO",
  "in-house": "In-house hire",
};

export interface ComparisonRow {
  label: string;
  values: Record<Competitor, string>;
  akrostech: string;
}

export function comparisonRows(soc2: boolean): readonly ComparisonRow[] {
  return [
    {
      label: "Time to start",
      values: { freelancers: "1–3 weeks", bpo: "4–8 weeks", "in-house": "6–12 weeks" },
      akrostech: "10 business days",
    },
    {
      label: "Who manages the work",
      values: { freelancers: "You", bpo: "An account manager", "in-house": "You" },
      akrostech: "A dedicated Akrostech lead",
    },
    {
      label: "Coverage when someone's out",
      values: { freelancers: "None", bpo: "Varies", "in-house": "None" },
      akrostech: "Built-in backup on every role",
    },
    {
      label: "Visibility",
      values: { freelancers: "Whatever they tell you", bpo: "Monthly report", "in-house": "Daily standup" },
      akrostech: "Live task log + Friday report",
    },
    {
      label: "Security controls",
      values: { freelancers: "Unknown", bpo: "Varies", "in-house": "Yours" },
      akrostech: soc2 ? "SOC 2 controls, NDA, access logs" : "NDA, least-privilege access, access logs",
    },
    {
      label: "Commitment",
      values: { freelancers: "Per project", bpo: "12–36 months", "in-house": "Permanent" },
      akrostech: "Month-to-month after 90 days",
    },
    {
      label: "Fully loaded cost",
      values: { freelancers: "$$", bpo: "$", "in-house": "$$$$" },
      akrostech: "$$",
    },
  ];
}

export interface Comparison {
  slug: "in-house-vs-akrostech" | "freelancers-vs-akrostech";
  competitor: Competitor;
  seo: { title: string; description: string };
  eyebrow: string;
  title: string;
  intro: string;
  /** The honest part: when the alternative is the right call. */
  theyWin: { title: string; points: readonly string[] };
  weWin: { title: string; points: readonly string[] };
  costNote: string;
  faqs: readonly FaqItem[];
  slab: string;
}

export const comparisons: readonly Comparison[] = [
  {
    slug: "in-house-vs-akrostech",
    competitor: "in-house",
    seo: {
      title: "In-house hire vs Akrostech",
      description:
        "When hiring in-house is the right call, when a managed team is, and how to compare the real cost of each.",
    },
    eyebrow: "In-house vs Akrostech",
    title: "Should you hire for it, or hand it over?",
    intro:
      "Sometimes the answer is a new hire. Here's an honest way to tell, side by side, with the cost worked out on your own numbers.",
    theyWin: {
      title: "Hire in-house when…",
      points: [
        "The work is core to what you sell, and the knowledge has to stay inside the company.",
        "It needs someone on site, in your office or your warehouse.",
        "It's steadily more than one person's full-time job, and you can wait six to twelve weeks to fill the seat.",
        "You want to build a team around the role over the next few years.",
      ],
    },
    weWin: {
      title: "Hand it to us when…",
      points: [
        "It's eating senior people's time: the controller coding invoices, the CTO screening CVs.",
        "The volume moves around, so a full-time hire would be idle half the month or underwater the other half.",
        "You need it running in two weeks, not after a quarter of recruiting.",
        "You can't afford a single point of failure when someone is sick, on leave or resigns.",
      ],
    },
    costNote:
      "A hire costs their salary plus benefits, payroll tax, equipment and management time, and it takes a quarter to fill. The calculator works out today's cost of the hours on your own figures, with the method shown.",
    faqs: [
      {
        id: "replace-hire",
        question: "Can we start with you and hire in-house later?",
        answer:
          "Yes, and some clients do. The SOPs we write belong to you, so whoever takes the work over starts from a documented process, not a blank page.",
      },
      {
        id: "contract",
        question: "What's the commitment?",
        answer:
          "A 90-day initial term, then month-to-month with 30 days' notice. If we're not earning the renewal, we shouldn't get it.",
      },
      {
        id: "management",
        question: "Who manages the people doing the work?",
        answer:
          "Your dedicated Akrostech lead. You agree the outcomes; we handle the day-to-day, cover absences and report every Friday.",
      },
    ],
    slab: "Not sure which way to go? We'll tell you honestly on a 20-minute call.",
  },
  {
    slug: "freelancers-vs-akrostech",
    competitor: "freelancers",
    seo: {
      title: "Freelancers vs Akrostech",
      description:
        "Freelancers are great for some work. Here's when they're the right call, when a managed team is, and how the two compare.",
    },
    eyebrow: "Freelancers vs Akrostech",
    title: "Freelancer or a managed team?",
    intro:
      "Freelancers are great for some work and a risk for other work. Here's how to tell which yours is, without the sales pitch.",
    theyWin: {
      title: "Use a freelancer when…",
      points: [
        "It's a one-off with a clear brief and an end date, like a logo or a landing page.",
        "You know exactly who you want and they have the time.",
        "Nobody else needs access to your systems or your customers' data.",
        "If they disappear for a week, nothing important stops.",
      ],
    },
    weWin: {
      title: "Use a managed team when…",
      points: [
        "The work is ongoing and someone has to own it, not just do tasks.",
        "It touches payroll, contracts, candidate data or production code, so access and NDAs matter.",
        "You need cover for holidays, sickness and resignations without starting over.",
        "You'd rather read a Friday report than chase someone for an update.",
      ],
    },
    costNote:
      "A freelancer's day rate looks cheaper until you add the hours you spend finding, briefing, checking and replacing them. The calculator puts a number on the time it takes from your team today.",
    faqs: [
      {
        id: "fit",
        question: "What if the person assigned to us isn't a fit?",
        answer:
          "Tell your lead. We'll replace them within 5 business days at no cost, with a proper handover.",
      },
      {
        id: "access",
        question: "How do you handle access to our systems?",
        answer:
          "Through accounts you create and control, with SSO where you have it. We follow least-privilege access, log everything, and revoke access within an hour of any change.",
      },
      {
        id: "small",
        question: "Is there a minimum size of engagement?",
        answer:
          "A pooled block starts from 40 hours a month, so you don't need a full-time role's worth of work to start.",
      },
    ],
    slab: "Want the reliability without the overhead? Let's talk for 20 minutes.",
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
