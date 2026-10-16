import { describe, expect, it } from "vitest";
import { isLiveRoute, prefetchFor } from "./site";

describe("live route registry", () => {
  it("treats built routes as live, ignoring query and hash", () => {
    expect(isLiveRoute("/")).toBe(true);
    expect(isLiveRoute("/?utm_source=linkedin")).toBe(true);
    expect(isLiveRoute("/#main")).toBe(true);
  });

  it("disables prefetch for routes that don't exist yet", () => {
    expect(isLiveRoute("/resources/back-office-calculator")).toBe(false);
    expect(prefetchFor("/resources/back-office-calculator")).toBe(false);
    expect(prefetchFor("/")).toBeUndefined();
  });
});
