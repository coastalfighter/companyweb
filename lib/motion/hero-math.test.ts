import { describe, expect, it } from "vitest";
import {
  checkedCount,
  depthLevel,
  flowOffset,
  formatAmount,
  glyphCount,
  orbitAngles,
  orbitPoint,
  pointerTilt,
} from "./hero-math";

describe("orbitPoint", () => {
  it("puts angle 0 on the right, π/2 nearest and largest", () => {
    const right = orbitPoint(0, 100, 50);
    expect(right.x).toBeCloseTo(100);
    expect(right.y).toBeCloseTo(0);
    const near = orbitPoint(Math.PI / 2, 100, 50);
    expect(near.z).toBeCloseTo(1);
    expect(near.y).toBeCloseTo(50);
    expect(near.scale).toBeCloseTo(1);
    expect(orbitPoint(-Math.PI / 2, 100, 50).scale).toBeCloseTo(0.78);
  });
});

describe("depthLevel", () => {
  it("quantizes depth into buckets, 0 nearest", () => {
    expect(depthLevel(1, 3)).toBe(0);
    expect(depthLevel(0, 3)).toBe(1);
    expect(depthLevel(-1, 3)).toBe(2);
    expect(depthLevel(-5, 3)).toBe(2);
    expect(depthLevel(0.5, 1)).toBe(0);
  });
});

describe("orbitAngles", () => {
  it("spaces cards evenly from the phase", () => {
    const angles = orbitAngles(4, 1);
    expect(angles).toHaveLength(4);
    expect(angles[0]).toBe(1);
    expect(angles[2]! - angles[1]!).toBeCloseTo(Math.PI / 2);
  });
});

describe("flowOffset", () => {
  it("spaces particles evenly and wraps into 0–1", () => {
    expect(flowOffset(0, 0, 3, 0.5)).toBe(0);
    expect(flowOffset(0, 1, 3, 0.5)).toBeCloseTo(1 / 3);
    expect(flowOffset(1, 0, 3, 0.5)).toBeCloseTo(0.5);
    expect(flowOffset(3, 0, 3, 0.5)).toBeCloseTo(0.5);
    expect(flowOffset(0, 0, 0, 1)).toBe(0);
  });
});

describe("pointerTilt", () => {
  it("leans toward the pointer within ±max", () => {
    expect(pointerTilt(50, 50, 100, 100, 4)).toEqual({ rotateX: -0, rotateY: 0 });
    expect(pointerTilt(100, 0, 100, 100, 4)).toEqual({ rotateX: 4, rotateY: 4 });
    expect(pointerTilt(-500, 900, 100, 100, 4)).toEqual({ rotateX: -4, rotateY: -4 });
    expect(pointerTilt(10, 10, 0, 0, 4)).toEqual({ rotateX: 0, rotateY: 0 });
  });
});

describe("checkedCount", () => {
  it("ticks steps one by one as the hero scrolls away", () => {
    expect(checkedCount(0, 4)).toBe(0);
    expect(checkedCount(0.12, 4)).toBe(0);
    expect(checkedCount(0.13, 4)).toBe(1);
    expect(checkedCount(0.41, 4)).toBe(2);
    expect(checkedCount(0.7, 4)).toBe(4);
    expect(checkedCount(1, 4)).toBe(4);
    expect(checkedCount(1, 0)).toBe(0);
  });
});

describe("formatAmount", () => {
  it("groups thousands without depending on the locale", () => {
    expect(formatAmount(0)).toBe("0");
    expect(formatAmount(999)).toBe("999");
    expect(formatAmount(128400)).toBe("128,400");
    expect(formatAmount(1234567.6)).toBe("1,234,568");
    expect(formatAmount(-84210)).toBe("-84,210");
  });
});

describe("glyphCount", () => {
  it("counts characters across tokens (code points, not UTF-16 units)", () => {
    expect(glyphCount([{ text: "const " }, { text: "x" }])).toBe(7);
    expect(glyphCount([{ text: "▍✓" }])).toBe(2);
    expect(glyphCount([])).toBe(0);
  });
});
