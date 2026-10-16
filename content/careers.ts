/**
 * Careers content (docs/blueprint/03-page-blueprints.md, section 12).
 *
 * `careersFacts` holds what the blueprint marks [VERIFY]: benefits, the learning
 * budget, where people can work from, and an employee quote. It ships empty and
 * each section that depends on it is not rendered until it is confirmed with HR.
 * Sample values for design review live in ./samples.ts (sampleCareersFacts).
 */

export interface Benefit {
  title: string;
  detail?: string;
}

export interface EmployeeQuote {
  text: string;
  name: string;
  role: string;
  /** Path under /public; a real, permissioned photo only. */
  photo?: string;
  /** Where the employee's written consent is filed (not rendered). */
  permission: string;
}

export interface CareersFacts {
  /** 12.3 benefits grid. */
  benefits: readonly Benefit[];
  /** e.g. "$1,500 a year". Shown in "Training that's actually funded." when set. */
  learningBudget: string | null;
  /** e.g. ["the Philippines", "Colombia", "Poland"]. Shown in "Remote, with real overlap." when set. */
  workCountries: readonly string[];
  /** 12.6 */
  quote: EmployeeQuote | null;
}

export const careersFacts: CareersFacts = {
  benefits: [],
  learningBudget: null,
  workCountries: [],
  quote: null,
};

/** "and"-joined list: ["A", "B", "C"] → "A, B and C". */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** 12.2, with verified specifics folded in when available. */
export function cultureItems(facts: CareersFacts = careersFacts) {
  return [
    {
      title: "Senior work, not ticket queues.",
      body: "You'll own a client's operations, not just tasks.",
    },
    {
      title: "Training that's actually funded.",
      body: facts.learningBudget
        ? `A ${facts.learningBudget} learning budget, and the certifications your client work needs, paid for.`
        : "The courses and certifications your client work needs, paid for.",
    },
    {
      title: "Remote, with real overlap.",
      body:
        facts.workCountries.length > 0
          ? `Work from home in ${joinList(facts.workCountries)}, with core hours that respect your time zone.`
          : "Work from home, with core hours that respect your time zone.",
    },
  ] as const;
}

/** 12.4 How we hire. */
export const hiringSteps = [
  { title: "Apply", detail: "5 minutes" },
  { title: "Skills task", detail: "Paid if it takes more than 2 hours" },
  { title: "Two interviews", detail: "Your team lead, then a client lead" },
  { title: "Offer", detail: "Within 48 hours of the last interview" },
] as const;
