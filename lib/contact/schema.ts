import * as z from "zod/mini";
import { type ServiceSlug } from "@/lib/services";

/**
 * Contact form schema (docs/blueprint/06-cta-conversion.md, F3.2), shared by the
 * browser (validation on blur) and the server action (the source of truth).
 * zod/mini keeps the client cost to a few KB.
 */

export const SERVICE_OPTIONS = [
  { value: "web-development", label: "Web Development" },
  { value: "recruitment", label: "Recruitment" },
  { value: "virtual-assistance", label: "Virtual Assistance" },
  { value: "accounting", label: "Accounting" },
  { value: "legal", label: "Legal Assistance" },
  { value: "not-sure", label: "Not sure yet" },
] as const satisfies readonly { value: ServiceSlug | "not-sure"; label: string }[];

export const COMPANY_SIZES = ["1–49", "50–199", "200–499", "500–1,999", "2,000+"] as const;

export const TIMELINES = [
  { value: "asap", label: "ASAP" },
  { value: "this-quarter", label: "This quarter" },
  { value: "next-quarter", label: "Next quarter" },
  { value: "exploring", label: "Just exploring" },
] as const;

export const DETAILS_MAX = 1500;
export const DETAILS_COUNTER_FROM = 1200;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number]["value"];
export type Timeline = (typeof TIMELINES)[number]["value"];

const serviceValues = SERVICE_OPTIONS.map((s) => s.value) as [ServiceOption, ...ServiceOption[]];
const timelineValues = TIMELINES.map((t) => t.value) as [Timeline, ...Timeline[]];

const name = (field: string, empty: string) =>
  z
    .string()
    .check(
      z.trim(),
      z.minLength(1, { error: empty }),
      z.maxLength(50, { error: `${field} can be at most 50 characters.` }),
    );

/** Normalizes a phone number toward E.164; empty stays empty. */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/[^\d]/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

export const contactSchema = z.object({
  firstName: name("First name", "We'd like to know who we're talking to."),
  lastName: name("Last name", "Please add your last name."),
  email: z
    .string()
    .check(
      z.trim(),
      z.toLowerCase(),
      z.minLength(1, { error: "We need an email to reply to." }),
      z.maxLength(254, { error: "That email is too long." }),
      z.email({ error: "That doesn't look like an email address." }),
    ),
  company: z
    .string()
    .check(
      z.trim(),
      z.minLength(1, { error: "Which company are you with?" }),
      z.maxLength(120, { error: "Company name can be at most 120 characters." }),
    ),
  companySize: z.enum(COMPANY_SIZES, { error: "Choose your company size." }),
  services: z
    .array(z.enum(serviceValues))
    .check(z.minLength(1, { error: "Pick at least one, or “Not sure yet”." })),
  details: z
    .string()
    .check(
      z.trim(),
      z.maxLength(DETAILS_MAX, { error: `Keep it under ${DETAILS_MAX.toLocaleString("en-US")} characters.` }),
    ),
  timeline: z.optional(z.enum(timelineValues)),
  nda: z.boolean(),
  phone: z.string().check(
    z.trim(),
    z.maxLength(30, { error: "That phone number is too long." }),
    z.refine((v) => v === "" || /^\+\d{7,15}$/.test(normalizePhone(v)), {
      error: "That doesn't look like a phone number.",
    }),
  ),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
export type ContactField = keyof ContactInput;
export type FieldErrors = Partial<Record<ContactField, string>>;

/** First error message per field, for display. */
export function validateContact(
  input: unknown,
): { ok: true; data: ContactData } | { ok: false; errors: FieldErrors } {
  const result = contactSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const flat = z.flattenError(result.error).fieldErrors as Partial<Record<ContactField, string[]>>;
  const errors: FieldErrors = {};
  for (const [field, messages] of Object.entries(flat)) {
    if (messages?.[0]) errors[field as ContactField] = messages[0];
  }
  return { ok: false, errors };
}

/** Validates a single field in the context of the full input (used on blur). */
export function validateField(field: ContactField, input: ContactInput): string | undefined {
  const result = validateContact(input);
  return result.ok ? undefined : result.errors[field];
}

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
]);

/** Soft warning only: personal email is allowed (F3.2). */
export function isPersonalEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain ? FREE_EMAIL_DOMAINS.has(domain) : false;
}

/** Reads the form's FormData into schema input. */
export function contactInputFromFormData(form: FormData): ContactInput {
  const str = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value : "";
  };
  const timeline = str("timeline");
  return {
    firstName: str("firstName"),
    lastName: str("lastName"),
    email: str("email"),
    company: str("company"),
    companySize: str("companySize") as ContactInput["companySize"],
    services: form
      .getAll("services")
      .filter((v): v is string => typeof v === "string") as ContactInput["services"],
    details: str("details"),
    timeline: timeline ? (timeline as Timeline) : undefined,
    nda: str("nda") === "on",
    phone: str("phone"),
  };
}

/** Attribution captured alongside the lead (hidden fields; never shown, length-capped). */
export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPage?: string;
  servicePrefill?: string;
  hubspotUtk?: string;
}

const ATTRIBUTION_KEYS: Record<keyof Attribution, string> = {
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmTerm: "utm_term",
  utmContent: "utm_content",
  referrer: "referrer",
  landingPage: "landing_page",
  servicePrefill: "service_param",
  hubspotUtk: "hutk",
};

export function attributionFromFormData(form: FormData): Attribution {
  const out: Attribution = {};
  for (const [key, field] of Object.entries(ATTRIBUTION_KEYS) as [keyof Attribution, string][]) {
    const value = form.get(field);
    if (typeof value === "string" && value.trim()) out[key] = value.trim().slice(0, 500);
  }
  return out;
}

export const ATTRIBUTION_FIELDS = Object.values(ATTRIBUTION_KEYS);

/** Honeypot input name: visually hidden, never filled by humans. */
export const HONEYPOT_FIELD = "website";
