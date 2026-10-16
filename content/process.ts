import { type FaqItem } from "./faq";

/**
 * How It Works content (docs/blueprint/03-page-blueprints.md, section 9). The
 * timings and policies here are commitments; they are listed in README
 * "Claims to confirm" and must match the proposal and MSA.
 */

export interface Phase {
  id: string;
  number: string;
  name: string;
  /** Short label for the hero rail and mobile stepper. */
  short: string;
  when: string;
  body: string;
  youGet: string;
  youDo: string;
}

export const phases: readonly Phase[] = [
  {
    id: "scoping-call",
    number: "01",
    name: "The scoping call",
    short: "Scope",
    when: "Day 1 · 45 min",
    body: "We ask about the work, not your budget. What's eating your team's time? What tools do you use? What does “done well” look like?",
    youGet: "A one-page Operating Brief within 24 hours.",
    youDo: "Bring the person who owns the work today.",
  },
  {
    id: "proposal",
    number: "02",
    name: "Proposal + agreement",
    short: "Agree",
    when: "Days 2–3",
    body: "A fixed quote, the named roles, the SLAs and a 90-day plan. Mutual NDA and DPA signed before any data is shared.",
    youGet: "Proposal, MSA, DPA, plus a sample Friday report.",
    youDo: "Review and sign, or ask us to change anything.",
  },
  {
    id: "team-match",
    number: "03",
    name: "Team match",
    short: "Match",
    when: "Days 3–6",
    body: "We select specialists for your stack and industry. You meet your lead on video before work starts. Don't like the fit? We match again.",
    youGet: "Your lead's name, profile and direct line.",
    youDo: "A 30-minute intro call.",
  },
  {
    id: "onboarding",
    number: "04",
    name: "Onboarding",
    short: "Onboard",
    when: "Days 6–10",
    body: "Access provisioned through your SSO. Shared channel set up. We document your processes as SOPs, which you keep even if we part ways.",
    youGet: "SOPs, access log, and a kick-off agenda.",
    youDo: "Grant access; walk us through one live example.",
  },
  {
    id: "run-and-report",
    number: "05",
    name: "Run + report",
    short: "Run",
    when: "Day 10 onward",
    body: "Work happens in your tools. Every Friday, a one-page report. Every month, a 30-minute review. Every quarter, a list of things we think you should change.",
    youGet: "Weekly report, monthly review, quarterly recommendations.",
    youDo: "Read a one-page report. That's it.",
  },
];

export interface Guarantee {
  id: string;
  title: string;
  body: string;
}

/**
 * Policies that need sign-off from finance and legal before they are published
 * (blueprint 9.4 "[VERIFY with finance/legal]"). A guarantee listed in
 * `pendingGuarantees` is not rendered until it moves to `guarantees`.
 */
export const guarantees: readonly Guarantee[] = [
  {
    id: "replacement",
    title: "5-day replacement.",
    body: "If a team member needs replacing, it happens within 5 business days, with handover.",
  },
  {
    id: "sops",
    title: "Your SOPs are yours.",
    body: "Everything we document belongs to you, even if you leave.",
  },
];

export const pendingGuarantees: readonly Guarantee[] = [
  {
    id: "fit",
    title: "The 30-day fit guarantee.",
    body: "If it's not working in the first 30 days, we'll re-match your team or refund the month.",
  },
];

/** Onboarding FAQ (9.6): time commitment, data access, time zones. */
export const processFaqs: readonly FaqItem[] = [
  {
    id: "time",
    question: "How much of our time does onboarding take?",
    answer:
      "About three hours across the first two weeks: the 45-minute scoping call, a 30-minute intro with your lead, and one walkthrough of a live example. After that, reading the Friday report.",
  },
  {
    id: "data-access",
    question: "When do you get access to our data?",
    answer:
      "Only after the NDA and DPA are signed, and only through accounts you create and control. We ask for the least access the work needs, keep an access log you can read, and revoke everything within one business day if you leave.",
  },
  {
    id: "time-zones",
    question: "How do time zones work?",
    answer:
      "Core overlap hours are written into your proposal, set against your business day, and we staff the team to them. Anything that can't wait for overlap goes to your lead's direct line.",
  },
  {
    id: "first-week",
    question: "What if the first match isn't right?",
    answer:
      "Say so after the intro call and we match again, before any work starts. Once work is running, a replacement happens within 5 business days, with a handover.",
  },
];
