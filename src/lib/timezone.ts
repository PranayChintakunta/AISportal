// lib/timezone.ts
import { TZDate } from "@date-fns/tz";
import { formatInTimeZone } from "date-fns-tz";

export const CHICAGO_TZ = "America/Chicago";

/**
 * 1. UTC Date (from DB) -> CT String for <input type="datetime-local">
 * Output format: "YYYY-MM-DDTHH:mm"
 */
export function utcToChicagoInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return formatInTimeZone(d, CHICAGO_TZ, "yyyy-MM-dd'T'HH:mm");
}

export const formatChicagoDateTimeInput = utcToChicagoInput;

/**
 * 2. CT String (from Form Input) -> UTC Date for Prisma
 * Input format: "YYYY-MM-DDTHH:mm"
 */
export function chicagoInputToUtc(localDateTimeString: string): Date {
  if (!localDateTimeString || typeof localDateTimeString !== "string") {
    return new Date(NaN);
  }

  // Extract date components directly from "YYYY-MM-DDTHH:mm"
  const [datePart, timePart] = localDateTimeString.split("T");
  if (!datePart || !timePart) return new Date(NaN);

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    isNaN(hours) ||
    isNaN(minutes)
  ) {
    return new Date(NaN);
  }

  // Pass individual integer components (Month is 0-indexed in JS Dates: January = 0)
  // This explicitly creates a TZDate anchored in Chicago time without UTC string misinterpretation.
  return new TZDate(year, month - 1, day, hours, minutes, 0, CHICAGO_TZ);
}

/**
 * 3. Formats a UTC ISO string or Date into a human-readable Chicago display format.
 */
export function formatChicagoDisplayDate(value?: Date | string | null): string {
  if (!value) return "TBD";

  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "TBD";

  return date.toLocaleString("en-US", {
    timeZone: CHICAGO_TZ,
    dateStyle: "medium",
    timeStyle: "short",
  });
}