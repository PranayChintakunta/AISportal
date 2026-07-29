"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EventStatus, EventTag } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validTagValues = [
  "FOOD",
  "DRINK",
  "SOCIAL",
  "LEARN",
  "WORKSHOP",
  "NETWORKING",
  "INDUSTRY",
] as const;

function parseTags(rawValue: FormDataEntryValue | null): EventTag[] {
  if (!rawValue) {
    return [];
  }

  return String(rawValue)
    .split(",")
    .map((tag) => tag.trim().toUpperCase())
    .filter((tag): tag is EventTag =>
      (validTagValues as readonly string[]).includes(tag)
    ) as EventTag[];
}

function parseStatus(rawValue: FormDataEntryValue | null): EventStatus {
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

export async function createEvent(formData: FormData) {
  const currentUser = await getAuthenticatedUser();

  if (!currentUser) {
    redirect("/sign-in");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const capacityValue = formData.get("capacity");
  const visibility = String(formData.get("visibility") ?? "public").trim() || "public";
  const tags = parseTags(formData.get("tags"));
  const status = parseStatus(formData.get("status"));

  if (!title || !description || !location || !startTime || !endTime) {
    throw new Error("Please fill out the event title, description, location, and schedule.");
  }

  const parsedStart = new Date(String(startTime));
  const parsedEnd = new Date(String(endTime));

  if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime()) || parsedEnd <= parsedStart) {
    throw new Error("Please choose a valid event window.");
  }

  const capacity = Number(capacityValue ?? 0);

  await prisma.event.create({
    data: {
      title,
      description,
      location,
      startTime: parsedStart,
      endTime: parsedEnd,
      status,
      capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : null,
      visibility,
      tags,
      createdById: currentUser.id,
    },
  });

  revalidatePath("/admin/events");
  redirect("/admin/events");
}
