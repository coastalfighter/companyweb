import { describe, expect, it } from "vitest";
import {
  attributionFromFormData,
  contactInputFromFormData,
  isPersonalEmail,
  normalizePhone,
  validateContact,
  validateField,
  type ContactInput,
} from "./schema";

const valid: ContactInput = {
  firstName: " Dana ",
  lastName: "Whitfield",
  email: " Dana@Tidemark.example ",
  company: "Tidemark",
  companySize: "200–499",
  services: ["accounting"],
  details: "Close takes 12 days.",
  timeline: "this-quarter",
  nda: true,
  phone: "",
};

describe("validateContact", () => {
  it("accepts a valid submission and normalizes it", () => {
    const result = validateContact(valid);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.firstName).toBe("Dana");
    expect(result.data.email).toBe("dana@tidemark.example");
  });

  it("returns the blueprint's friendly messages", () => {
    const result = validateContact({ ...valid, firstName: "  ", email: "nope", services: [] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.firstName).toBe("We'd like to know who we're talking to.");
    expect(result.errors.email).toBe("That doesn't look like an email address.");
    expect(result.errors.services).toBe("Pick at least one, or “Not sure yet”.");
  });

  it("requires a known company size and rejects unknown services", () => {
    const result = validateContact({
      ...valid,
      companySize: "huge" as ContactInput["companySize"],
      services: ["crypto"] as unknown as ContactInput["services"],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.companySize).toBe("Choose your company size.");
    expect(result.errors.services).toBeDefined();
  });

  it("caps details at 1,500 characters", () => {
    const result = validateContact({ ...valid, details: "x".repeat(1501) });
    expect(result.ok).toBe(false);
  });

  it("validates phone only when given", () => {
    expect(validateContact({ ...valid, phone: "" }).ok).toBe(true);
    expect(validateContact({ ...valid, phone: "(415) 555-0134" }).ok).toBe(true);
    expect(validateContact({ ...valid, phone: "call me" }).ok).toBe(false);
  });

  it("validates one field in context", () => {
    expect(validateField("lastName", { ...valid, lastName: "" })).toBe("Please add your last name.");
    expect(validateField("lastName", valid)).toBeUndefined();
  });
});

describe("helpers", () => {
  it("normalizes phone numbers toward E.164", () => {
    expect(normalizePhone("(415) 555-0134")).toBe("+14155550134");
    expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958");
    expect(normalizePhone("  ")).toBe("");
  });

  it("flags personal email domains for a soft warning", () => {
    expect(isPersonalEmail("someone@gmail.com")).toBe(true);
    expect(isPersonalEmail("cfo@tidemark.example")).toBe(false);
  });

  it("reads FormData, including multi-value services and the NDA checkbox", () => {
    const form = new FormData();
    form.set("firstName", "Dana");
    form.append("services", "accounting");
    form.append("services", "legal");
    form.set("nda", "on");
    form.set("utm_source", "linkedin");
    form.set("referrer", "x".repeat(900));
    const input = contactInputFromFormData(form);
    expect(input.services).toEqual(["accounting", "legal"]);
    expect(input.nda).toBe(true);
    expect(input.timeline).toBeUndefined();
    const attribution = attributionFromFormData(form);
    expect(attribution.utmSource).toBe("linkedin");
    expect(attribution.referrer).toHaveLength(500);
  });
});
