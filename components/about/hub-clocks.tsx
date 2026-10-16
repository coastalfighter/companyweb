"use client";

import { useSyncExternalStore } from "react";
import { type Hub } from "@/content/company";

/**
 * Minute ticker shared by every clock on the page: one timeout, aligned to the
 * next minute boundary, so the clocks change together and never drift.
 */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;
let now = 0;

function schedule() {
  now = Date.now();
  timer = setTimeout(
    () => {
      schedule();
      listeners.forEach((listener) => listener());
    },
    60_000 - (now % 60_000),
  );
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) schedule();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
}

/** Floored to the minute so the snapshot is stable between ticks. */
const getSnapshot = () => Math.floor((timer === undefined ? Date.now() : now) / 60_000) * 60_000;
// The server never renders a time: it would be stale by the time the page is read.
const getServerSnapshot = () => null;

const formatters = new Map<string, Intl.DateTimeFormat>();

export function formatHubTime(timeZone: string, at: number): string {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" });
    formatters.set(timeZone, formatter);
  }
  return formatter.format(at);
}

/**
 * Hub list with live local times (blueprint 8.6), minute precision. Before
 * hydration the time slot is empty but sized, so nothing shifts when it fills.
 */
export function HubClocks({ hubs }: { hubs: readonly Hub[] }) {
  const at = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-3 text-body text-fg-muted">
      {hubs.map((hub) => (
        <li key={hub.city} className="flex items-baseline gap-2">
          <span className="font-medium text-fg">{hub.city}</span>
          <time
            data-testid="hub-time"
            className="tabular inline-block min-w-[8ch] font-mono text-body-sm text-fg-muted"
            dateTime={at === null ? undefined : new Date(at).toISOString()}
          >
            {at === null ? "" : formatHubTime(hub.timeZone, at)}
          </time>
        </li>
      ))}
    </ul>
  );
}
