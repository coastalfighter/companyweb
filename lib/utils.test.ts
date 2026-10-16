import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins conditional classes", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("keeps a custom font-size and a text color together", () => {
    expect(cn("text-h2", "text-fg")).toBe("text-h2 text-fg");
  });

  it("lets a later font-size override an earlier one", () => {
    expect(cn("text-h2", "text-h3")).toBe("text-h3");
  });

  it("lets a later shadow token override an earlier one", () => {
    expect(cn("shadow-e1", "shadow-e3")).toBe("shadow-e3");
  });
});
