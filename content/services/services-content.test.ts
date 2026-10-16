import { describe, expect, it } from "vitest";
import { homeFaqs } from "@/components/home/faq-section";
import { proof } from "@/content/proof";
import { services } from "@/lib/services";
import { careersFacts, cultureItems, hiringSteps } from "@/content/careers";
import { caseStudies } from "@/content/case-studies";
import { comparisonRows, comparisons } from "@/content/compare";
import { company, operatingRules, principles } from "@/content/company";
import { guarantees, pendingGuarantees, phases, processFaqs } from "@/content/process";
import { getServiceContent, serviceContent } from "./index";

/** Copy bans from docs/blueprint/README.md ("Non-negotiables"). */
const BANNED = [
  /\bsynerg/i,
  /best[- ]in[- ]class/i,
  /end[- ]to[- ]end solution/i,
  /\bleverag(e|ing)\b/i,
  /\bseamless/i,
  /cutting[- ]edge/i,
  /world[- ]class/i,
  /one[- ]stop[- ]shop/i,
  /we deliver excellence/i,
  /!/, // "No exclamation marks, ever" (A9)
];

/** Placeholder markers that must never ship. */
const PLACEHOLDERS = [/\[VERIFY/i, /\[SAMPLE/i, /\bTODO\b/, /lorem ipsum/i, /\bTBD\b/];

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const all = Object.values(serviceContent);

describe("service content", () => {
  it("has content for exactly the five services, keyed by slug", () => {
    expect(Object.keys(serviceContent).sort()).toEqual(services.map((s) => s.slug).sort());
    for (const [slug, content] of Object.entries(serviceContent)) expect(content.slug).toBe(slug);
  });

  it.each(all.map((c) => [c.slug, c] as const))("%s follows the S1–S12 template", (_slug, content) => {
    expect(content.scope).toHaveLength(6);
    expect(content.roles).toHaveLength(3);
    expect(content.limits.length).toBeGreaterThanOrEqual(3);
    expect(content.timeline.steps.length).toBeGreaterThanOrEqual(4);
    expect(content.tools.length).toBeGreaterThanOrEqual(10);
    expect(content.slas.length).toBeGreaterThanOrEqual(4);
    expect(content.faqs.length).toBeGreaterThanOrEqual(4);
    expect(new Set(content.faqs.map((f) => f.id)).size).toBe(content.faqs.length);
    expect(new Set(content.tools).size).toBe(content.tools.length);
    expect(content.seo.description.length).toBeGreaterThan(80);
    expect(content.seo.description.length).toBeLessThanOrEqual(220);
  });

  it("relates each service to two other, distinct services", () => {
    for (const content of all) {
      const [a, b] = content.related;
      expect(a).not.toBe(b);
      expect(content.related).not.toContain(content.slug);
    }
  });

  it("ships no unverified proof", () => {
    for (const content of all) {
      expect(content.metrics).toHaveLength(0);
      expect(content.proof.caseStudy).toBeNull();
      expect(content.proof.testimonial).toBeNull();
    }
  });

  it("keeps the regulatory notes on legal and accounting", () => {
    expect(serviceContent.legal.hero.subtitle).toContain("not a law firm");
    expect(serviceContent.legal.limitsNote).toContain("not a law firm");
    expect(serviceContent.accounting.limitsNote).toContain("not a licensed CPA firm");
  });

  it("looks up content safely", () => {
    expect(getServiceContent("legal")?.slug).toBe("legal");
    expect(getServiceContent("toString")).toBeUndefined();
    expect(getServiceContent("nope")).toBeUndefined();
  });
});

describe("copy rules (all shipped content)", () => {
  const corpus = [
    ...strings(serviceContent),
    ...strings(services),
    ...strings(homeFaqs),
    ...strings(proof),
    ...strings(company),
    ...strings(operatingRules),
    ...strings(principles),
    ...strings(phases),
    ...strings(guarantees),
    ...strings(pendingGuarantees),
    ...strings(processFaqs),
    ...strings(caseStudies),
    ...strings(careersFacts),
    ...strings(cultureItems()),
    ...strings(hiringSteps),
    ...strings(comparisons),
    ...strings(comparisonRows(false)),
  ];

  it.each(BANNED.map((re) => [re.source, re] as const))("never uses %s", (_name, re) => {
    expect(corpus.filter((s) => re.test(s))).toEqual([]);
  });

  it("has no placeholder markers", () => {
    for (const re of PLACEHOLDERS) expect(corpus.filter((s) => re.test(s))).toEqual([]);
  });
});
