import { type ServiceContent } from "./types";

export const recruitment: ServiceContent = {
  slug: "recruitment",
  seo: {
    title: "Recruitment Assistance",
    description:
      "Sourcing, structured screening and scheduling, run inside your ATS. You interview people already worth your time; the final call is always yours.",
  },
  hero: {
    eyebrow: "02 · Recruitment",
    title: "The Right People. Faster.",
    subtitle: "We source, screen, and deliver talent your in-house team can't reach.",
    cta: "Book a hiring scoping call",
    secondary: { label: "See our process", href: "#timeline-title" },
  },
  metrics: [],
  scope: [
    {
      title: "Sourcing.",
      body: "Outbound on LinkedIn, GitHub, niche boards and referrals. We find people who aren't applying.",
    },
    {
      title: "Screening.",
      body: "Structured phone screens against a scorecard you approve. Every candidate gets the same questions.",
    },
    {
      title: "Skills assessments.",
      body: "Coordinated take-homes, technical screens or work samples, run through your tools.",
    },
    {
      title: "Interview scheduling.",
      body: "We juggle five calendars so your hiring managers don't have to.",
    },
    {
      title: "Candidate experience.",
      body: "Every applicant hears back, including the rejections. Your employer brand stays intact.",
    },
    {
      title: "ATS hygiene and reporting.",
      body: "Clean pipelines in Greenhouse, Lever, Ashby or Workable, plus a weekly funnel report.",
    },
  ],
  limits: [
    "Make hiring decisions (you always do).",
    "Contingency “resume dumps.”",
    "Executive search for C-suite roles.",
    "Employer-of-record or payroll for hires (ask about our accounting team instead).",
  ],
  timeline: {
    label: "Per role",
    steps: [
      {
        when: "Day 1",
        title: "Intake",
        body: "A 45-minute call with the hiring manager. We write the scorecard and job post together.",
      },
      {
        when: "Days 2–3",
        title: "Calibration",
        body: "We send 5 sample profiles. You tell us “yes, no, closer.” This step saves weeks.",
      },
      {
        when: "Days 4–10",
        title: "Source + screen",
        body: "Daily outreach, structured screens, and a live pipeline you can see.",
      },
      {
        when: "Day 10",
        title: "Shortlist",
        body: "3–5 candidates with written screen notes and scorecard ratings.",
      },
      {
        when: "Day 11 onward",
        title: "Interview + close",
        body: "We schedule, gather feedback within 24 hours, and support offer logistics.",
      },
    ],
  },
  tools: [
    "Greenhouse",
    "Lever",
    "Ashby",
    "Workable",
    "BambooHR",
    "LinkedIn Recruiter",
    "GitHub",
    "Calendly",
    "Google Workspace",
    "Microsoft 365",
    "Slack",
    "Teams",
  ],
  roles: [
    { title: "Talent Lead", detail: "Agency or in-house background, 7+ years. Owns your hiring plan." },
    {
      title: "Technical Sourcer",
      detail: "Reads code, and knows the difference between React and React Native.",
    },
    { title: "Recruiting Coordinator", detail: "Scheduling, candidate communications and ATS." },
  ],
  slas: [
    ["First calibration profiles", "48 hours"],
    ["Response to applicants", "Within 3 business days"],
    ["Interview scheduling", "Within 24 hours"],
    ["Shortlist delivery", "10 business days"],
    ["Weekly funnel report", "Mondays"],
  ],
  proof: { caseStudy: null, testimonial: null },
  faqs: [
    {
      id: "fees",
      question: "Do you charge a percentage of salary?",
      answer:
        "No. You pay a flat monthly fee, so we're never incentivized to push a higher salary or a faster-but-worse hire.",
    },
    {
      id: "roles",
      question: "Which roles do you recruit for?",
      answer:
        "Engineering, product, design, finance, operations, customer success, and sales up to Director level.",
    },
    {
      id: "brand",
      question: "Will candidates know you're a third party?",
      answer: "Your call. Most clients have us recruit under their brand, using an @yourcompany.com address.",
    },
    {
      id: "guarantee",
      question: "What if a hire doesn't work out?",
      answer: "If they leave within 90 days, we re-run the search at no extra cost.",
    },
    {
      id: "data",
      question: "How do you handle candidate data?",
      answer: "Inside your ATS, under your privacy policy. We don't keep a separate copy.",
    },
  ],
  related: ["virtual-assistance", "accounting"],
  slab: "Stop screening. Start interviewing people worth your time.",
};
