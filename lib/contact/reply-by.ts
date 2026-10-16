/**
 * When should a lead expect a reply? Adds business hours (Mon–Fri, 8 AM–6 PM in the
 * team's time zone) to `now`. Used for "You'll hear from us by 2:30 PM ET today."
 * VERIFY: business hours and time zone (README "Claims to confirm").
 */
export const BUSINESS_TIME_ZONE = "America/New_York";
export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 18;
const STEP_MS = 15 * 60 * 1000;

function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { weekday: get("weekday"), hour: Number(get("hour")), minute: Number(get("minute")) };
}

function isOpen(date: Date, timeZone: string): boolean {
  const { weekday, hour } = localParts(date, timeZone);
  return weekday !== "Sat" && weekday !== "Sun" && hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

/** Adds `hours` of business time, walking in 15-minute steps (handles weekends and DST). */
export function addBusinessHours(now: Date, hours: number, timeZone = BUSINESS_TIME_ZONE): Date {
  let remaining = hours * 4; // quarter-hours
  let t = new Date(Math.ceil(now.getTime() / STEP_MS) * STEP_MS);
  let guard = 0;
  while (remaining > 0 && guard++ < 7 * 24 * 4) {
    if (isOpen(t, timeZone)) remaining -= 1;
    t = new Date(t.getTime() + STEP_MS);
  }
  return t;
}

/** "2:30 PM ET today" / "10:00 AM ET tomorrow" / "10:00 AM ET Monday". */
export function formatReplyBy(target: Date, now: Date, timeZone = BUSINESS_TIME_ZONE): string {
  const time = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(
    target,
  );
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone, dateStyle: "short" }).format(d);
  const today = day(now);
  const tomorrow = day(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const when =
    day(target) === today
      ? "today"
      : day(target) === tomorrow
        ? "tomorrow"
        : new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(target);
  return `${time} ET ${when}`;
}
