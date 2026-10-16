/**
 * VERIFIED COMPANY FACTS ONLY (About page, docs/blueprint/03-page-blueprints.md, 8.2–8.6).
 *
 * Like ./proof.ts, everything here is published as fact. Each About section that
 * depends on a field below is not rendered while that field is empty, so the live
 * page never shows a placeholder story, a guessed headcount or a stock portrait.
 * Illustrative data for design review lives in ./samples.ts (sampleCompany).
 */

export interface CompanyNumber {
  value: string;
  label: string;
  /** Where the figure comes from (not rendered). */
  source: string;
}

export interface Leader {
  name: string;
  role: string;
  /** One line, e.g. "Ran operations at Northwind through 4× growth." */
  background: string;
  previously: readonly string[];
  /** Path under /public. Real portraits only; omitted renders an initials tile. */
  portrait?: string;
  linkedin?: string;
}

export interface Hub {
  city: string;
  /** IANA time zone, e.g. "Asia/Manila". */
  timeZone: string;
  /** Coordinates, for the dot on the map (decimal degrees). */
  lat: number;
  lon: number;
}

export interface CompanyFacts {
  /**
   * The true origin story (8.2), as paragraphs that run before the three rules.
   * Empty means the section shows the rules alone, without a founding narrative.
   */
  originStory: readonly string[];
  /** Closing paragraph after the rules, e.g. "Today we're 120 specialists in 4 countries…". */
  originToday: string | null;
  numbers: readonly CompanyNumber[];
  leadership: readonly Leader[];
  hubs: readonly Hub[];
}

export const company: CompanyFacts = {
  originStory: [],
  originToday: null,
  numbers: [],
  leadership: [],
  hubs: [],
};

/**
 * The three operating rules (8.2). These are policies, not proof: each one is
 * already stated elsewhere on the site (weekly reports, senior hiring, 90-day term
 * then month-to-month) and is tracked in README "Claims to confirm".
 */
export const operatingRules = [
  { title: "Show the work.", body: "Every task logged. Every week reported." },
  { title: "Hire senior, then train obsessively.", body: "We'd rather have fewer, better people." },
  {
    title: "Earn the renewal.",
    body: "Month-to-month after 90 days, because lock-in is a crutch for bad service.",
  },
] as const;

/** Principles (8.3). */
export const principles = [
  {
    title: "Precision over polish.",
    body: "A correct report in plain text beats a beautiful one with a wrong number.",
  },
  {
    title: "Calm is a service.",
    body: "Nothing we do should create urgency for you. If something's on fire, we tell you, with a fix.",
  },
  {
    title: "Default to visible.",
    body: "If you have to ask what we're doing, we've already failed.",
  },
  {
    title: "Your tools, your data, your call.",
    body: "We work inside your systems and leave them cleaner than we found them.",
  },
] as const;

/** Initials for a portrait fallback tile: "Dana Whitfield" → "DW". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}
