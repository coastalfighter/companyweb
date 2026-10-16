import { describe, expect, it } from "vitest";
import { SECURITY_TOPIC_DETAILS, prefillFromSearch } from "./prefill";

const p = (query: string) => prefillFromSearch(new URLSearchParams(query));

describe("prefillFromSearch", () => {
  it("preselects a known service and ignores unknown ones", () => {
    expect(p("service=accounting").services).toEqual(["accounting"]);
    expect(p("service=crypto").services).toEqual([]);
  });

  it("expands bundles without duplicates", () => {
    expect(p("bundle=finance-backbone&service=legal").services.sort()).toEqual(["accounting", "legal"]);
    expect(p("bundle=nope").services).toEqual([]);
  });

  it("sets up a security review", () => {
    expect(p("topic=security")).toEqual({ services: [], nda: true, details: SECURITY_TOPIC_DETAILS });
    expect(p("topic=quote")).toEqual({ services: [], nda: false, details: "" });
  });
});
