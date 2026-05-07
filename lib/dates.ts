const TZ = "America/New_York";

/** Format a date for display, always in Eastern Time */
export function formatDateET(
  date: Date | string,
  opts: Intl.DateTimeFormatOptions = {}
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...opts,
  });
}

/** Short format for lists / OG images */
export function formatDateShortET(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Convert a UTC ISO string to the "YYYY-MM-DDTHH:MM" format in ET,
 * suitable for populating a datetime-local input.
 */
export function utcIsoToETInput(utcIso: string): string {
  const d = new Date(utcIso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour") === "24" ? "00" : get("hour");
  const minute = get("minute");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Parse a datetime-local string as ET and return a UTC ISO string.
 * Handles EDT (-04:00) and EST (-05:00) automatically.
 */
export function etInputToISO(localStr: string): string {
  // Use a rough UTC estimate to determine which ET offset applies (DST or not)
  const roughUTC = new Date(localStr + "Z");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    timeZoneName: "shortOffset",
  }).formatToParts(roughUTC);

  const offsetStr =
    parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-4";
  const match = offsetStr.match(/GMT([+-]\d{1,2})/);
  const offsetHours = match ? parseInt(match[1]) : -4;
  const sign = offsetHours < 0 ? "-" : "+";
  const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");

  return new Date(`${localStr}:00${sign}${pad(offsetHours)}:00`).toISOString();
}
