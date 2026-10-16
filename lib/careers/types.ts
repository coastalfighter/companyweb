/** A job description as structured text (never raw ATS HTML). */
export type JobBlock =
  { kind: "heading"; text: string } | { kind: "paragraph"; text: string } | { kind: "list"; items: string[] };

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY" | "INTERN";

export interface JobSalary {
  /** Display text, e.g. "$60K – $80K per year". */
  text: string;
  min?: number;
  max?: number;
  currency?: string;
  /** schema.org unitText: HOUR, DAY, WEEK, MONTH, YEAR. */
  unit?: "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";
}

export interface Job {
  /** ATS id. */
  id: string;
  /** URL segment: title + short id, stable across rebuilds. */
  slug: string;
  title: string;
  /** Normalised team (the careers filter), e.g. "Finance". */
  team: string;
  location: string;
  remote: boolean;
  employmentType?: EmploymentType;
  salary?: JobSalary;
  /** ISO date-time. */
  publishedAt: string;
  /** The ATS-hosted application form. */
  applyUrl: string;
  description: JobBlock[];
}

export type AtsProvider = "ashby" | "greenhouse" | "lever";

export interface AtsConfig {
  provider: AtsProvider;
  /** Ashby job board name, Greenhouse board token or Lever site name. */
  board: string;
}

export type JobsResult =
  | { status: "ok"; jobs: Job[] }
  /** No ATS configured: show the talent-pool empty state. */
  | { status: "unconfigured"; jobs: [] }
  /** The ATS didn't answer: link to its board instead of claiming there are no roles. */
  | { status: "error"; jobs: []; boardUrl: string };
