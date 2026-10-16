import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY,
  SEED_TASKS,
  advanceClock,
  formatClock,
  initialFeedState,
  nextFeedState,
  type FeedState,
} from "./ops-feed-data";

/** Deterministic random source that cycles through the given values. */
function sequence(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length]!;
}

describe("formatClock", () => {
  it("zero-pads hours and minutes", () => {
    expect(formatClock(9 * 60 + 5)).toBe("09:05");
    expect(formatClock(17 * 60 + 59)).toBe("17:59");
  });
});

describe("advanceClock", () => {
  it("advances between 4 and 11 minutes", () => {
    expect(advanceClock(600, () => 0)).toBe(604);
    expect(advanceClock(600, () => 0.999)).toBe(611);
  });

  it("caps at 17:59", () => {
    expect(advanceClock(17 * 60 + 58, () => 0.5)).toBe(17 * 60 + 59);
  });
});

describe("nextFeedState", () => {
  it("starts from the seed tasks", () => {
    const state = initialFeedState(38);
    expect(state.tasks).toHaveLength(SEED_TASKS.length);
    expect(state.completed).toBe(38);
  });

  it("adds a new completed task at the top when the review roll fails", () => {
    const state = nextFeedState(initialFeedState(38), sequence(0, 0.9));
    expect(state.tasks[0]).toMatchObject({ tag: "HIR", status: "done", time: "12:12" });
    expect(state.completed).toBe(39);
  });

  it("resolves the pending review task and moves it to the top", () => {
    const state = nextFeedState(initialFeedState(38), sequence(0, 0.1));
    expect(state.tasks[0]).toMatchObject({ text: "Vendor MSA redline · approved", status: "done" });
    expect(state.tasks.filter((t) => t.status === "review")).toHaveLength(0);
    expect(state.tasks).toHaveLength(SEED_TASKS.length);
    expect(state.completed).toBe(39);
  });

  it("queues a fresh review item every fourth task when none is pending", () => {
    let state: FeedState = { ...initialFeedState(0), tasks: [], cursor: 3 };
    state = nextFeedState(state, sequence(0, 0.9));
    expect(state.tasks[0]).toMatchObject({ status: "review", time: "in review" });
    expect(state.completed).toBe(0);
  });

  it("keeps completed timestamps in descending order over many ticks", () => {
    let state = initialFeedState(0);
    const random = sequence(0.3, 0.6, 0.1, 0.8, 0.5, 0.2, 0.95);
    for (let i = 0; i < 60; i++) state = nextFeedState(state, random);
    const times = state.tasks.filter((t) => t.status === "done").map((t) => t.time);
    const sorted = [...times].sort().reverse();
    expect(times).toEqual(sorted);
  });

  it("caps history length and keeps ids unique", () => {
    let state = initialFeedState(0);
    for (let i = 0; i < 100; i++) state = nextFeedState(state);
    expect(state.tasks.length).toBeLessThanOrEqual(MAX_HISTORY);
    expect(new Set(state.tasks.map((t) => t.id)).size).toBe(state.tasks.length);
  });

  it("does not mutate the previous state", () => {
    const before = initialFeedState(5);
    const snapshot = structuredClone(before);
    nextFeedState(before);
    expect(before).toEqual(snapshot);
  });
});
