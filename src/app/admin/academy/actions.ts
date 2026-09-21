"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TEAM } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAcademy, canPublishAcademy } from "@/lib/roles";
import { deleteObjectFromR2 } from "@/lib/r2";
import {
  extractStorageKeyFromUrl,
  parseChicagoTimeToUtc,
  parseStatus,
  resolveEventImageUrl,
} from "@/lib/admin/event-form-parsing";

type AcademyActor = { id: string; role: string; team: TEAM | null };

async function authorizeAcademyUser(): Promise<AcademyActor> {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/onboarding");
  }

  if (!canManageAcademy(user.role, user.team)) {
    throw new Error("Unauthorized action.");
  }

  return { id: user.id, role: user.role, team: user.team };
}

/**
 * Recordings are links rather than uploads, so the only thing worth enforcing
 * is that it is a real web URL — a pasted "N/A" or a bare filename should not
 * reach the member-facing player.
 */
function parseRecordingUrl(rawValue: FormDataEntryValue | null): string | null {
  const value = String(rawValue ?? "").trim();
  if (!value) return null;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Recording link must be a full URL, e.g. https://youtube.com/watch?v=…");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Recording link must start with http:// or https://");
  }

  return parsed.toString();
}

type WorkshopFields = {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  recordingUrl: string | null;
  summary: string | null;
  quizDueAt: Date | null;
};

function readWorkshopFields(formData: FormData): WorkshopFields {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");

  if (!title || !description || !location || !startTime || !endTime) {
    throw new Error(
      "Please fill out the workshop title, description, location, and schedule."
    );
  }

  const parsedStart = parseChicagoTimeToUtc(String(startTime));
  const parsedEnd = parseChicagoTimeToUtc(String(endTime));

  if (
    Number.isNaN(parsedStart.getTime()) ||
    Number.isNaN(parsedEnd.getTime()) ||
    parsedEnd <= parsedStart
  ) {
    throw new Error("Please choose a valid workshop window.");
  }

  const rawQuizDue = String(formData.get("quizDueAt") ?? "").trim();
  const quizDueAt = rawQuizDue ? parseChicagoTimeToUtc(rawQuizDue) : null;

  if (quizDueAt && Number.isNaN(quizDueAt.getTime())) {
    throw new Error("Please choose a valid quiz due date.");
  }

  return {
    title,
    description,
    location,
    startTime: parsedStart,
    endTime: parsedEnd,
    recordingUrl: parseRecordingUrl(formData.get("recordingUrl")),
    summary: String(formData.get("summary") ?? "").trim() || null,
    quizDueAt,
  };
}

/** Officers may draft; only Directors and Executives may publish. */
function resolvePublishState(
  action: string,
  role: string,
  current: boolean
): boolean {
  if (action !== "publish" && action !== "unpublish") return current;

  if (!canPublishAcademy(role)) {
    throw new Error("Only a Director or Executive can publish a workshop.");
  }

  return action === "publish";
}

export async function createWorkshop(formData: FormData) {
  const actor = await authorizeAcademyUser();
  const fields = readWorkshopFields(formData);

  const status = parseStatus(formData.get("status"));
  const imageUrl = await resolveEventImageUrl(formData.get("image"));

  const isPublished = resolvePublishState(
    String(formData.get("action") ?? "draft"),
    actor.role,
    false
  );

  await prisma.workshop.create({
    data: {
      title: fields.title,
      description: fields.description,
      location: fields.location,
      startTime: fields.startTime,
      endTime: fields.endTime,
      status,
      imageUrl,
      isPublished,
      recordingUrl: fields.recordingUrl,
      summary: fields.summary,
      quizDueAt: fields.quizDueAt,
      createdById: actor.id,
    },
  });

  revalidatePath("/admin/academy/workshops");
  revalidatePath("/academy");
  redirect("/admin/academy/workshops");
}

export async function updateWorkshop(formData: FormData) {
  const actor = await authorizeAcademyUser();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Workshop ID is missing.");

  const existing = await prisma.workshop.findUnique({
    where: { id },
    select: {
      imageUrl: true,
      isPublished: true,
    },
  });

  if (!existing) {
    throw new Error("Workshop not found.");
  }

  if (existing.isPublished && actor.role === "OFFICER") {
    redirect("/admin/academy/workshops");
  }

  const fields = readWorkshopFields(formData);
  const status = parseStatus(formData.get("status"));
  const imageUrl = await resolveEventImageUrl(formData.get("image"), existing.imageUrl);

  const isPublished = resolvePublishState(
    String(formData.get("action") ?? ""),
    actor.role,
    existing.isPublished
  );

  await prisma.workshop.update({
    where: { id },
    data: {
      title: fields.title,
      description: fields.description,
      location: fields.location,
      startTime: fields.startTime,
      endTime: fields.endTime,
      status,
      imageUrl,
      isPublished,
      recordingUrl: fields.recordingUrl,
      summary: fields.summary,
      quizDueAt: fields.quizDueAt,
    },
  });

  revalidatePath("/admin/academy/workshops");
  revalidatePath(`/admin/academy/workshops/${id}/edit`);
  revalidatePath("/academy");
  redirect("/admin/academy/workshops");
}

export async function deleteWorkshop(formData: FormData): Promise<void> {
  const actor = await authorizeAcademyUser();

  if (!canPublishAcademy(actor.role)) {
    throw new Error("Only a Director or Executive can delete a workshop.");
  }

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Workshop ID is missing.");

  const existing = await prisma.workshop.findUnique({
    where: { id },
    select: { imageUrl: true },
  });

  if (!existing) {
    throw new Error("Workshop not found.");
  }

  // Deleting the Workshop row automatically cascades to Attendance, Quiz, and QuizAttempts
  await prisma.workshop.delete({ where: { id } });

  if (existing.imageUrl) {
    const storageKey = extractStorageKeyFromUrl(existing.imageUrl);
    if (storageKey) {
      deleteObjectFromR2(storageKey).catch((err) =>
        console.error("Failed to delete workshop image from R2:", err)
      );
    }
  }

  revalidatePath("/admin/academy/workshops");
  revalidatePath("/academy");
  redirect("/admin/academy/workshops");
}