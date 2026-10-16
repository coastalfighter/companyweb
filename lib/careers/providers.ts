import * as z from "zod/mini";
import { htmlToBlocks, plainToBlocks } from "./html-text";
import type { TEAMS } from "./labels";
import { type AtsConfig, type EmploymentType, type Job, type JobBlock, type JobSalary } from "./types";

/**
 * Public job-board APIs (no credentials needed, read-only):
 * - Ashby:      GET https://api.ashbyhq.com/posting-api/job-board/{board}?includeCompensation=true
 * - Greenhouse: GET https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true
 * - Lever:      GET https://api.lever.co/v0/postings/{board}?mode=json
 * Each response is validated before use; postings that don't parse are skipped,
 * never shown half-empty.
 */

export function boardApiUrl({ provider, board }: AtsConfig): string {
  const b = encodeURIComponent(board);
  switch (provider) {
    case "ashby":
      return `https://api.ashbyhq.com/posting-api/job-board/${b}?includeCompensation=true`;
    case "greenhouse":
      return `https://boards-api.greenhouse.io/v1/boards/${b}/jobs?content=true`;
    case "lever":
      return `https://api.lever.co/v0/postings/${b}?mode=json`;
  }
}

/** The public board page, linked when the API can't be reached. */
export function boardPageUrl({ provider, board }: AtsConfig): string {
  const b = encodeURIComponent(board);
  switch (provider) {
    case "ashby":
      return `https://jobs.ashbyhq.com/${b}`;
    case "greenhouse":
      return `https://job-boards.greenhouse.io/${b}`;
    case "lever":
      return `https://jobs.lever.co/${b}`;
  }
}

/** "Senior Bookkeeper (Remote)" + "a1b2c3d4-…" → "senior-bookkeeper-remote-a1b2c3d4". */
export function jobSlug(title: string, id: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  const suffix = id
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  return [base || "role", suffix].filter(Boolean).join("-");
}

const TEAM_PATTERNS: readonly [RegExp, (typeof TEAMS)[number]][] = [
  [/engineer|develop|web|design|tech|product/i, "Engineering"],
  [/recruit|talent|sourc|people|hr\b/i, "Recruiting"],
  [/assist|admin|operations support|executive|\bva\b/i, "Assistance"],
  [/financ|account|bookkeep|payroll|\bap\b|\bar\b/i, "Finance"],
  [/legal|contract|complian|paralegal/i, "Legal Ops"],
];

export function normaliseTeam(name: string | undefined): string {
  const value = name?.trim() ?? "";
  if (!value) return "Other";
  return TEAM_PATTERNS.find(([re]) => re.test(value))?.[1] ?? value;
}

const currencyFormat = (currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
  } catch {
    return null;
  }
};

const INTERVALS: Record<string, NonNullable<JobSalary["unit"]>> = {
  "per-hour-wage": "HOUR",
  "per-day-wage": "DAY",
  "per-week-salary": "WEEK",
  "per-month-salary": "MONTH",
  "per-year-salary": "YEAR",
  "1 HOUR": "HOUR",
  "1 DAY": "DAY",
  "1 WEEK": "WEEK",
  "1 MONTH": "MONTH",
  "1 YEAR": "YEAR",
};

const UNIT_LABEL = { HOUR: "hour", DAY: "day", WEEK: "week", MONTH: "month", YEAR: "year" } as const;

export function formatSalary(
  min: number | undefined,
  max: number | undefined,
  currency: string | undefined,
  unit: JobSalary["unit"],
): JobSalary | undefined {
  if (!currency || (min === undefined && max === undefined)) return undefined;
  const format = currencyFormat(currency);
  if (!format) return undefined;
  const range =
    min !== undefined && max !== undefined && min !== max
      ? `${format.format(min)} – ${format.format(max)}`
      : format.format((min ?? max)!);
  return { text: unit ? `${range} per ${UNIT_LABEL[unit]}` : range, min, max, currency, unit };
}

const EMPLOYMENT: Record<string, EmploymentType> = {
  fulltime: "FULL_TIME",
  "full-time": "FULL_TIME",
  "full time": "FULL_TIME",
  parttime: "PART_TIME",
  "part-time": "PART_TIME",
  "part time": "PART_TIME",
  contract: "CONTRACTOR",
  contractor: "CONTRACTOR",
  temporary: "TEMPORARY",
  intern: "INTERN",
  internship: "INTERN",
};

export function normaliseEmployment(value: string | undefined): EmploymentType | undefined {
  return value ? EMPLOYMENT[value.trim().toLowerCase()] : undefined;
}

const isRemoteText = (value: string) => /remote|anywhere|work from home/i.test(value);

function toIso(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function httpsUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** `data[key]` when it is an array, else []. */
function envelope(data: unknown, key: string): unknown[] {
  const value = data && typeof data === "object" ? (data as Record<string, unknown>)[key] : undefined;
  return Array.isArray(value) ? value : [];
}

/** Items that match the schema; the rest are skipped (one bad posting never hides the board). */
function eachValid<T>(items: readonly unknown[], schema: z.ZodMiniType<T>): T[] {
  return items.flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/* ---------- Ashby ---------- */

const ashbyJob = z.object({
  id: z.string(),
  title: z.string(),
  department: z.optional(z.nullable(z.string())),
  team: z.optional(z.nullable(z.string())),
  employmentType: z.optional(z.nullable(z.string())),
  location: z.optional(z.nullable(z.string())),
  isRemote: z.optional(z.nullable(z.boolean())),
  isListed: z.optional(z.nullable(z.boolean())),
  publishedAt: z.optional(z.nullable(z.string())),
  jobUrl: z.optional(z.nullable(z.string())),
  applyUrl: z.optional(z.nullable(z.string())),
  descriptionHtml: z.optional(z.nullable(z.string())),
  descriptionPlain: z.optional(z.nullable(z.string())),
  compensation: z.optional(
    z.nullable(
      z.object({
        summaryComponents: z.optional(
          z.array(
            z.object({
              compensationType: z.optional(z.nullable(z.string())),
              interval: z.optional(z.nullable(z.string())),
              currencyCode: z.optional(z.nullable(z.string())),
              minValue: z.optional(z.nullable(z.number())),
              maxValue: z.optional(z.nullable(z.number())),
            }),
          ),
        ),
      }),
    ),
  ),
});

export function parseAshby(data: unknown): Job[] {
  return eachValid(envelope(data, "jobs"), ashbyJob).flatMap((job): Job[] => {
    const applyUrl = httpsUrl(job.applyUrl ?? job.jobUrl ?? undefined);
    const publishedAt = toIso(job.publishedAt ?? undefined);
    if (job.isListed === false || !applyUrl || !publishedAt) return [];
    const salary = job.compensation?.summaryComponents?.find((c) => c.compensationType === "Salary");
    const location = job.location?.trim() || (job.isRemote ? "Remote" : "");
    return [
      {
        id: job.id,
        slug: jobSlug(job.title, job.id),
        title: job.title.trim(),
        team: normaliseTeam(job.team ?? job.department ?? undefined),
        location,
        remote: Boolean(job.isRemote) || isRemoteText(location),
        employmentType: normaliseEmployment(job.employmentType ?? undefined),
        salary: salary
          ? formatSalary(
              salary.minValue ?? undefined,
              salary.maxValue ?? undefined,
              salary.currencyCode ?? undefined,
              INTERVALS[salary.interval ?? ""],
            )
          : undefined,
        publishedAt,
        applyUrl,
        description: job.descriptionHtml
          ? htmlToBlocks(job.descriptionHtml)
          : plainToBlocks(job.descriptionPlain ?? ""),
      },
    ];
  });
}

/* ---------- Greenhouse ---------- */

const greenhouseJob = z.object({
  id: z.number(),
  title: z.string(),
  updated_at: z.optional(z.nullable(z.string())),
  first_published: z.optional(z.nullable(z.string())),
  absolute_url: z.optional(z.nullable(z.string())),
  location: z.optional(z.nullable(z.object({ name: z.optional(z.nullable(z.string())) }))),
  content: z.optional(z.nullable(z.string())),
  departments: z.optional(z.array(z.object({ name: z.optional(z.nullable(z.string())) }))),
});

export function parseGreenhouse(data: unknown): Job[] {
  return eachValid(envelope(data, "jobs"), greenhouseJob).flatMap((job): Job[] => {
    const id = String(job.id);
    const applyUrl = httpsUrl(job.absolute_url ?? undefined);
    const publishedAt = toIso(job.first_published ?? job.updated_at ?? undefined);
    if (!applyUrl || !publishedAt) return [];
    const location = job.location?.name?.trim() ?? "";
    return [
      {
        id,
        slug: jobSlug(job.title, id),
        title: job.title.trim(),
        team: normaliseTeam(job.departments?.[0]?.name ?? undefined),
        location,
        remote: isRemoteText(location),
        publishedAt,
        applyUrl,
        description: htmlToBlocks(job.content ?? ""),
      },
    ];
  });
}

/* ---------- Lever ---------- */

const leverJob = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.optional(z.nullable(z.number())),
  hostedUrl: z.optional(z.nullable(z.string())),
  applyUrl: z.optional(z.nullable(z.string())),
  workplaceType: z.optional(z.nullable(z.string())),
  categories: z.optional(
    z.nullable(
      z.object({
        team: z.optional(z.nullable(z.string())),
        department: z.optional(z.nullable(z.string())),
        location: z.optional(z.nullable(z.string())),
        commitment: z.optional(z.nullable(z.string())),
      }),
    ),
  ),
  descriptionPlain: z.optional(z.nullable(z.string())),
  lists: z.optional(z.array(z.object({ text: z.string(), content: z.string() }))),
  additionalPlain: z.optional(z.nullable(z.string())),
  salaryRange: z.optional(
    z.nullable(
      z.object({
        min: z.optional(z.nullable(z.number())),
        max: z.optional(z.nullable(z.number())),
        currency: z.optional(z.nullable(z.string())),
        interval: z.optional(z.nullable(z.string())),
      }),
    ),
  ),
});

export function parseLever(data: unknown): Job[] {
  return eachValid(Array.isArray(data) ? data : [], leverJob).flatMap((job): Job[] => {
    const applyUrl = httpsUrl(job.applyUrl ?? job.hostedUrl ?? undefined);
    const publishedAt = toIso(job.createdAt ?? undefined);
    if (!applyUrl || !publishedAt) return [];
    const location = job.categories?.location?.trim() ?? "";
    const description: JobBlock[] = [
      ...plainToBlocks(job.descriptionPlain ?? ""),
      ...(job.lists ?? []).flatMap((list): JobBlock[] => {
        const items = htmlToBlocks(`<ul>${list.content}</ul>`).flatMap((b) =>
          b.kind === "list" ? b.items : [],
        );
        return items.length > 0
          ? [
              { kind: "heading", text: list.text.trim() },
              { kind: "list", items },
            ]
          : [];
      }),
      ...plainToBlocks(job.additionalPlain ?? ""),
    ];
    const range = job.salaryRange;
    return [
      {
        id: job.id,
        slug: jobSlug(job.text, job.id),
        title: job.text.trim(),
        team: normaliseTeam(job.categories?.team ?? job.categories?.department ?? undefined),
        location,
        remote: job.workplaceType === "remote" || isRemoteText(location),
        employmentType: normaliseEmployment(job.categories?.commitment ?? undefined),
        salary: range
          ? formatSalary(
              range.min ?? undefined,
              range.max ?? undefined,
              range.currency ?? undefined,
              INTERVALS[range.interval ?? ""],
            )
          : undefined,
        publishedAt,
        applyUrl,
        description,
      },
    ];
  });
}

export function parseBoard(provider: AtsConfig["provider"], data: unknown): Job[] {
  switch (provider) {
    case "ashby":
      return parseAshby(data);
    case "greenhouse":
      return parseGreenhouse(data);
    case "lever":
      return parseLever(data);
  }
}
