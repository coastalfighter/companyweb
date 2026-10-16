/**
 * Ops Feed data + pure state transitions.
 * The feed is illustrative (an example of the client task log), and the
 * component announces it as such to assistive tech. Wire to real ops data
 * before presenting numbers as live (docs/blueprint/README.md, honesty gates).
 */

export type ServiceTag = "WEB" | "HIR" | "ADM" | "FIN" | "LEG";
export type TaskStatus = "done" | "review";

export interface OpsTask {
  id: string;
  tag: ServiceTag;
  text: string;
  /** "HH:MM" when done, or "in review". */
  time: string;
  status: TaskStatus;
}

export interface FeedState {
  tasks: OpsTask[];
  completed: number;
  /** Simulated workday clock in minutes since 00:00. */
  clock: number;
  /** Index into STREAM_TASKS for the next new task. */
  cursor: number;
}

export const SERVICE_LABELS: Record<ServiceTag, string> = {
  WEB: "Web",
  HIR: "Hiring",
  ADM: "Admin",
  FIN: "Finance",
  LEG: "Legal",
};

/** Newest first. */
export const SEED_TASKS: readonly OpsTask[] = [
  { id: "s1", tag: "FIN", text: "Q3 accruals reconciled · 0 variances", time: "12:08", status: "done" },
  { id: "s2", tag: "ADM", text: "Board deck formatted · sent to 7 directors", time: "11:30", status: "done" },
  { id: "s3", tag: "WEB", text: "Checkout LCP 3.1s → 1.2s", time: "11:03", status: "done" },
  { id: "s4", tag: "LEG", text: "Vendor MSA redline · round 2", time: "in review", status: "review" },
  { id: "s5", tag: "HIR", text: "Shortlist sent · Sr. Backend Engineer", time: "10:15", status: "done" },
  { id: "s6", tag: "FIN", text: "Payroll run closed · 214 employees", time: "09:42", status: "done" },
];

export const STREAM_TASKS: ReadonlyArray<Pick<OpsTask, "tag" | "text">> = [
  { tag: "HIR", text: "4 interviews scheduled · Product Designer" },
  { tag: "ADM", text: "Inbox triaged · 186 → 9 flagged" },
  { tag: "LEG", text: "NDA executed · Larkspur Freight" },
  { tag: "WEB", text: "Pricing page shipped to staging" },
  { tag: "FIN", text: "AP run approved · 42 invoices · $318,400" },
  { tag: "HIR", text: "Offer accepted · Data Engineer" },
  { tag: "LEG", text: "Renewal flagged · notice due in 60 days" },
  { tag: "ADM", text: "Offsite booked · 18 travelers, 3 cities" },
  { tag: "WEB", text: "Accessibility fixes merged · 0 axe issues" },
  { tag: "FIN", text: "Bank recs complete · 6 accounts" },
];

/** Queued periodically so the feed never looks implausibly perfect. */
export const REVIEW_TASK: Pick<OpsTask, "tag" | "text"> = {
  tag: "LEG",
  text: "Customer DPA redline · round 1",
};

export const MAX_HISTORY = 24;
const DAY_END = 17 * 60 + 59;

export function initialFeedState(completed: number): FeedState {
  return { tasks: [...SEED_TASKS], completed, clock: 12 * 60 + 8, cursor: 0 };
}

/** Advances the simulated clock by 4–11 minutes, capped at 17:59. */
export function advanceClock(minutes: number, random: () => number = Math.random): number {
  return Math.min(minutes + 4 + Math.floor(random() * 8), DAY_END);
}

export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * One feed tick. Either resolves the pending "in review" task (25% chance),
 * or adds the next stream task. Every fourth new task is a fresh review item
 * when none is pending. Pure: same input + random sequence → same output.
 */
export function nextFeedState(state: FeedState, random: () => number = Math.random): FeedState {
  const clock = advanceClock(state.clock, random);
  const time = formatClock(clock);
  const reviewIdx = state.tasks.findIndex((t) => t.status === "review");

  if (reviewIdx > -1 && random() < 0.25) {
    const pending = state.tasks[reviewIdx]!;
    const resolved: OpsTask = {
      ...pending,
      id: `${pending.id}-done-${clock}`,
      text: pending.text.replace(/round \d+/, "approved"),
      time,
      status: "done",
    };
    const rest = state.tasks.filter((_, i) => i !== reviewIdx);
    return {
      ...state,
      clock,
      completed: state.completed + 1,
      tasks: [resolved, ...rest].slice(0, MAX_HISTORY),
    };
  }

  const cursor = state.cursor + 1;
  const queueReview = reviewIdx === -1 && cursor % 4 === 0;
  const source = queueReview ? REVIEW_TASK : STREAM_TASKS[state.cursor % STREAM_TASKS.length]!;
  const task: OpsTask = {
    id: `t${cursor}-${clock}`,
    tag: source.tag,
    text: source.text,
    time: queueReview ? "in review" : time,
    status: queueReview ? "review" : "done",
  };

  return {
    clock,
    cursor,
    completed: queueReview ? state.completed : state.completed + 1,
    tasks: [task, ...state.tasks].slice(0, MAX_HISTORY),
  };
}
