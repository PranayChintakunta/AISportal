import { EventStatus, EventTag, type MembershipType } from "@prisma/client";
import { isAssignableProgram } from "@/lib/roles";
import { putObjectToR2 } from "@/lib/r2";

/**
 * Shared parsing for the admin event and workshop forms. A workshop is an
 * Event underneath, so both surfaces submit the same field shapes and must
 * agree on how they are read — timezone handling especially.
 */

const VALID_TAG_VALUES = [
  "FOOD",
  "DRINK",
  "SOCIAL",
  "LEARN",
  "WORKSHOP",
  "NETWORKING",
  "INDUSTRY",
] as const;

/**
 * `datetime-local` gives a wall-clock string with no zone. Officers enter
 * times in Chicago, so resolve that city's offset for the given date rather
 * than assuming a fixed -05:00 and breaking across DST.
 */
export function parseChicagoTimeToUtc(localDateTimeString: string): Date {
  if (!localDateTimeString) return new Date(NaN);

  const targetDate = new Date(`${localDateTimeString}:00Z`);
  if (isNaN(targetDate.getTime())) return new Date(NaN);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    timeZoneName: "shortOffset",
  });

  const parts = formatter.formatToParts(targetDate);
  const timeZoneName = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";

  const match = timeZoneName.match(/GMT([+-]\d+)/);
  if (!match) return new Date(`${localDateTimeString}:00-05:00`);

  const hours = parseInt(match[1], 10);
  const sign = hours >= 0 ? "+" : "-";
  const padHours = Math.abs(hours).toString().padStart(2, "0");
  const offset = `${sign}${padHours}:00`;

  return new Date(`${localDateTimeString}:00${offset}`);
}

/** Handles both single entry strings and array form values. */
export function parsePrograms(
  rawValue: FormDataEntryValue | FormDataEntryValue[] | null
): MembershipType[] {
  if (!rawValue) return [];
  const entries = Array.isArray(rawValue) ? rawValue : [rawValue];

  return entries
    .flatMap((entry) => String(entry).split(","))
    .map((value) => value.trim().toUpperCase())
    .filter(isAssignableProgram);
}

export function parseTags(
  rawValue: FormDataEntryValue | FormDataEntryValue[] | null
): EventTag[] {
  if (!rawValue) return [];
  const entries = Array.isArray(rawValue) ? rawValue : [rawValue];

  return entries
    .flatMap((entry) => String(entry).split(","))
    .map((tag) => tag.trim().toUpperCase())
    .filter((tag): tag is EventTag =>
      (VALID_TAG_VALUES as readonly string[]).includes(tag)
    );
}

export function parseStatus(rawValue: FormDataEntryValue | null): EventStatus {
  const value = String(rawValue ?? "UPCOMING").trim().toUpperCase();

  switch (value) {
    case "LIVE":
      return EventStatus.LIVE;
    case "CLOSED":
      return EventStatus.CLOSED;
    case "ARCHIVED":
      return EventStatus.ARCHIVED;
    default:
      return EventStatus.UPCOMING;
  }
}

function isImageFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

/** Uploads a newly picked cover image, or keeps the existing one. */
export async function resolveEventImageUrl(
  file: FormDataEntryValue | null,
  existingImageUrl?: string | null
): Promise<string | null> {
  if (!isImageFile(file)) {
    return existingImageUrl ?? null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Cover must be an image file.");
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Cover image must be under 2 MB.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `events/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const data = Buffer.from(await file.arrayBuffer());

  const publicUrl = await putObjectToR2(key, data, file.type || "image/jpeg");

  if (!publicUrl) {
    throw new Error(
      "Failed to upload image to R2. Please check server logs for R2 configuration errors."
    );
  }

  return publicUrl;
}

/** Recovers the R2 object key from a stored public URL, for cleanup on delete. */
export function extractStorageKeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
  } catch {
    return null;
  }
}
