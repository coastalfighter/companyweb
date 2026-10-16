/**
 * Trust Center and legal-page facts (docs/blueprint/05-trust-credibility.md, E2.5).
 *
 * Two kinds of content live here:
 * - facts the code can vouch for (which processors this website uses, what it
 *   stores in the browser), derived from configuration so they can't drift;
 * - commitments only Akrostech can make (certifications, insurance, incident
 *   timelines, retention periods, the legal entity). Those ship null/empty and
 *   the sections built on them are not rendered until they're filled in.
 */
import { CALCULATOR_STORAGE_KEY } from "@/lib/calculator/saved";

/** Security practices already stated on the homepage security band (README "Claims to confirm"). */
export const securityPractices = [
  "Background-checked staff",
  "NDA signed before scoping",
  "SSO + hardware-key MFA on all staff accounts",
  "Least-privilege access, revoked within 1 hour of offboarding",
  "Encrypted at rest (AES-256) and in transit (TLS 1.3)",
  "GDPR / CCPA DPAs available",
] as const;

export interface Certification {
  name: string;
  auditor: string;
  /** ISO date of the latest report or certificate. */
  reportDate: string;
}

export interface LegalEntity {
  /** Registered legal name, e.g. "Akrostech Solutions LLC". */
  name: string;
  address: string;
  /** e.g. "the State of Delaware, USA" — used in the terms' governing-law clause. */
  jurisdiction: string;
}

export interface TrustFacts {
  /** Held certifications, with auditor and report date (E2.5). */
  certifications: readonly Certification[];
  /** e.g. "$5M cyber liability and E&O coverage" (E4). */
  insurance: string | null;
  /** e.g. "Checkr: identity, criminal and employment history" (E4). */
  staffVetting: string | null;
  /** Incident response summary, in your words, with the timelines you commit to. */
  incidentResponse: string | null;
  /** How long client engagement data is kept after an engagement ends. */
  clientDataRetention: string | null;
  /** Where the website is hosted, e.g. "Vercel (United States)". */
  hosting: string | null;
  /** Public status page (P2). */
  statusPageUrl: string | null;
  legalEntity: LegalEntity | null;
  /** Email for privacy requests; falls back to the main address. */
  privacyEmail: string | null;
}

export const trustFacts: TrustFacts = {
  certifications: [],
  insurance: null,
  staffVetting: null,
  incidentResponse: null,
  clientDataRetention: null,
  hosting: null,
  statusPageUrl: null,
  legalEntity: null,
  privacyEmail: null,
};

/** When the legal pages were last changed. Update with every material edit. */
export const LEGAL_LAST_UPDATED = "2026-10-16";

export interface Processor {
  name: string;
  purpose: string;
  data: string;
}

/**
 * The third parties this website sends personal data to, from its configuration
 * (see .env.example). Only integrations that are switched on are listed.
 */
export function websiteProcessors(
  env: NodeJS.ProcessEnv = process.env,
  facts: TrustFacts = trustFacts,
): Processor[] {
  const has = (...keys: string[]) => keys.every((k) => Boolean(env[k]?.trim()));
  const list: Processor[] = [];
  if (facts.hosting)
    list.push({
      name: facts.hosting,
      purpose: "Hosting this website",
      data: "Request data (IP address, browser, pages requested)",
    });
  if (has("HUBSPOT_PRIVATE_APP_TOKEN", "HUBSPOT_PORTAL_ID", "HUBSPOT_FORM_ID"))
    list.push({
      name: "HubSpot",
      purpose: "Our CRM: records enquiries and report requests",
      data: "What you enter in our forms, and where you came from",
    });
  if (has("SLACK_LEADS_WEBHOOK_URL"))
    list.push({
      name: "Slack",
      purpose: "Notifies our team of a new enquiry",
      data: "Your name, company, email and message",
    });
  if (has("RESEND_API_KEY", "LEADS_FROM_EMAIL"))
    list.push({
      name: "Resend",
      purpose: "Sends our confirmation and report emails",
      data: "Your name and email, and the report",
    });
  if (has("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"))
    list.push({
      name: "Cloudflare (Turnstile)",
      purpose: "Checks that form submissions come from a person",
      data: "Browser and device signals, IP address",
    });
  if (has("UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"))
    list.push({
      name: "Upstash",
      purpose: "Limits how often a form can be sent",
      data: "IP address, kept for one hour",
    });
  if (has("ATS_PROVIDER", "ATS_BOARD")) {
    const provider = env.ATS_PROVIDER!.trim().toLowerCase();
    const name =
      provider === "ashby"
        ? "Ashby"
        : provider === "greenhouse"
          ? "Greenhouse"
          : provider === "lever"
            ? "Lever"
            : null;
    if (name)
      list.push({
        name,
        purpose: "Hosts our job applications",
        data: "What you submit when you apply (on their site)",
      });
  }
  if (has("NEXT_PUBLIC_POSTHOG_KEY"))
    list.push({
      name: "PostHog",
      purpose: "Anonymous usage analytics, only if you allow it",
      data: "Pages viewed and buttons used; no form contents",
    });
  return list;
}

export interface StoredItem {
  key: string;
  where: "localStorage" | "sessionStorage";
  purpose: string;
  lasts: string;
}

/**
 * Everything this site keeps in your browser. It sets no cookies of its own;
 * the keys here are the real ones used in the code (tested).
 */
export const browserStorage: readonly StoredItem[] = [
  {
    key: CALCULATOR_STORAGE_KEY,
    where: "localStorage",
    purpose: "Your cost-calculator inputs, so you can pick up where you left off",
    lasts: "Until you press “Start over” or clear site data",
  },
  {
    key: "akros:contact-draft",
    where: "sessionStorage",
    purpose: "An unsent contact form, so a reload doesn't lose your answers",
    lasts: "Until you send it or close the tab",
  },
  {
    key: "akros:contact-result",
    where: "sessionStorage",
    purpose: "Your first name, to greet you on the thank-you page",
    lasts: "Until you close the tab",
  },
  {
    key: "akros:attribution",
    where: "sessionStorage",
    purpose: "Which page or campaign brought you here, sent with your enquiry",
    lasts: "Until you close the tab",
  },
];
