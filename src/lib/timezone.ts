export const PT = "America/Los_Angeles";
export const PH = "Asia/Manila";

/** Offset (minutes) of a time zone from UTC at a given instant. Handles DST via Intl. */
export function tzOffset(utcMs: number, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(utcMs));
  const g = (t: string) => Number(parts.find((x) => x.type === t)?.value);
  return (Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute")) - utcMs) / 60000;
}

/** Convert a wall-clock date + time in `tz` to a UTC timestamp. */
export function wallToUtc(date: string, time: string, tz: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const off = tzOffset(guess, tz);
  let utc = guess - off * 60000;
  const off2 = tzOffset(utc, tz);
  if (off2 !== off) utc = guess - off2 * 60000;
  return utc;
}

export function fmtIn(utc: number, tz: string, withDate = true) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, ...(withDate ? { weekday: "short", month: "short", day: "numeric" } : {}), hour: "numeric", minute: "2-digit" }).format(new Date(utc));
}

export function tzAbbr(utc: number, tz: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date(utc)).find((p) => p.type === "timeZoneName")?.value ?? tz;
}

/** "10:00 AM PT → Thu 1:00 AM PHT" */
export function ptToPh(date: string, time: string) {
  const utc = wallToUtc(date, time, PT);
  return { utc, pt: fmtIn(utc, PT, false), ph: fmtIn(utc, PH), diffHours: (tzOffset(utc, PH) - tzOffset(utc, PT)) / 60 };
}

export function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
