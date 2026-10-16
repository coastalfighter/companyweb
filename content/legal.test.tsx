import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LegalDocument } from "@/components/legal/legal-document";
import {
  accessibilityContent,
  cookiesContent,
  dpaContent,
  privacyContent,
  termsContent,
  trustContent,
  type DocumentContent,
} from "./legal";
import { browserStorage, browserStorageItems, trustFacts, websiteProcessors, type TrustFacts } from "./trust";

const env = (vars: Record<string, string> = {}) => vars as unknown as NodeJS.ProcessEnv;
const ids = (doc: DocumentContent) => doc.sections.map((s) => s.id);

const fullFacts: TrustFacts = {
  ...trustFacts,
  certifications: [{ name: "SOC 2 Type II", auditor: "Sample Audit LLP", reportDate: "2026-06-30" }],
  insurance: "$5M cyber liability and E&O",
  staffVetting: "Checkr: identity, criminal and employment history",
  incidentResponse: "We notify affected clients within 24 hours.",
  statusPageUrl: "https://status.example.com",
  legalEntity: {
    name: "Akrostech Solutions LLC",
    address: "1 Example St",
    jurisdiction: "the State of Delaware, USA",
  },
};

function renderDoc(doc: DocumentContent) {
  return render(
    <LegalDocument
      eyebrow="Legal"
      title={doc.title}
      intro={doc.intro}
      lastUpdated="2026-10-16"
      breadcrumb={[]}
      sections={doc.sections}
    />,
  );
}

describe("trust facts gating", () => {
  it("ships with nothing only Akrostech can commit to", () => {
    expect(trustFacts.certifications).toHaveLength(0);
    expect(trustFacts.insurance).toBeNull();
    expect(trustFacts.staffVetting).toBeNull();
    expect(trustFacts.incidentResponse).toBeNull();
    expect(trustFacts.legalEntity).toBeNull();
  });

  it("leaves unconfirmed sections off the trust center", () => {
    const doc = trustContent(env(), trustFacts);
    expect(ids(doc)).toEqual(["practices", "client-data", "sub-processors", "disclosure", "documents"]);
  });

  it("adds them once confirmed", () => {
    const doc = trustContent(env(), fullFacts);
    expect(ids(doc)).toEqual([
      "certifications",
      "practices",
      "client-data",
      "sub-processors",
      "incidents",
      "disclosure",
      "status",
      "documents",
    ]);
    renderDoc(doc);
    expect(screen.getByRole("table", { name: "Certifications held" })).toHaveTextContent("Sample Audit LLP");
    expect(screen.getByText(/\$5M cyber liability/)).toBeInTheDocument();
  });

  it("only adds a governing-law clause with a real jurisdiction", () => {
    expect(ids(termsContent(trustFacts))).not.toContain("law");
    expect(ids(termsContent(fullFacts))).toContain("law");
  });
});

describe("websiteProcessors", () => {
  it("lists only integrations that are switched on", () => {
    expect(websiteProcessors(env(), trustFacts)).toEqual([]);
    const names = websiteProcessors(
      env({
        HUBSPOT_PRIVATE_APP_TOKEN: "t",
        HUBSPOT_PORTAL_ID: "1",
        HUBSPOT_FORM_ID: "f",
        SLACK_LEADS_WEBHOOK_URL: "https://hooks.slack.com/x",
        RESEND_API_KEY: "k",
        // Incomplete: one Turnstile key without the other.
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site",
        ATS_PROVIDER: "greenhouse",
        ATS_BOARD: "akros",
      }),
      { ...trustFacts, hosting: "Vercel (United States)" },
    ).map((p) => p.name);
    expect(names).toEqual(["Vercel (United States)", "HubSpot", "Slack", "Greenhouse"]);
  });

  it("says so plainly when there are none", () => {
    renderDoc(privacyContent(env(), trustFacts));
    expect(
      screen.getByText(/doesn't currently send personal data to any third-party service/),
    ).toBeInTheDocument();
  });
});

describe("browser storage disclosure", () => {
  it("names every storage key the code actually uses", () => {
    const sources = [
      "lib/calculator/saved.ts",
      "components/contact/contact-form.tsx",
      "components/layout/attribution-tracker.tsx",
    ]
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    const used = [...sources.matchAll(/STORAGE_KEY = "([^"]+)"/g)].map((m) => m[1]);
    expect(used.length).toBeGreaterThanOrEqual(4);
    expect(browserStorage.map((s) => s.key).sort()).toEqual([...used].sort());
  });

  it("adds the consent choice and PostHog's ID only when analytics is configured", () => {
    expect(browserStorageItems(env())).toEqual(browserStorage);
    const keys = browserStorageItems(env({ NEXT_PUBLIC_POSTHOG_KEY: "phc_abc" })).map((i) => i.key);
    expect(keys).toEqual([
      ...browserStorage.map((i) => i.key),
      "akros:consent",
      "ph_phc_abc_posthog",
      "__ph_opt_in_out_phc_abc",
    ]);
    renderDoc(cookiesContent(env({ NEXT_PUBLIC_POSTHOG_KEY: "phc_abc" })));
    expect(screen.getByRole("heading", { name: "Analytics" })).toBeInTheDocument();
  });

  it("lists Sentry once error reporting is on", () => {
    expect(
      websiteProcessors(env({ SENTRY_DSN: "https://k@o1.ingest.sentry.io/1" }), trustFacts).map(
        (p) => p.name,
      ),
    ).toEqual(["Sentry"]);
  });

  it("lists them on the cookies page", () => {
    renderDoc(cookiesContent(env()));
    const table = screen.getByRole("table", { name: "Browser storage used by this website" });
    for (const item of browserStorage) expect(within(table).getByText(item.key)).toBeInTheDocument();
    expect(screen.queryByText(/Cloudflare Turnstile/)).not.toBeInTheDocument();
  });
});

describe("documents render", () => {
  it.each([
    ["privacy", privacyContent(env())],
    ["terms", termsContent()],
    ["cookies", cookiesContent(env())],
    ["dpa", dpaContent()],
    ["accessibility", accessibilityContent()],
    ["trust", trustContent(env())],
  ])("%s has a contents list matching its sections", (_name, doc) => {
    renderDoc(doc);
    const nav = screen.getByRole("navigation", { name: "Contents" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(ids(doc).map((id) => `#${id}`));
    expect(new Set(ids(doc)).size).toBe(doc.sections.length);
    expect(screen.getByText("October 16, 2026")).toBeInTheDocument();
  });

  it("keeps the disclosure anchor that security.txt points to", () => {
    expect(ids(trustContent(env()))).toContain("disclosure");
  });
});
