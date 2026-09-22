"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAcademy } from "@/lib/roles";

async function authorize() {
  const user = await getAuthenticatedUser();

  if (!user) redirect("/onboarding");
  if (!canManageAcademy(user.role, user.team)) {
    throw new Error("Unauthorized action.");
  }

  return user;
}

function refresh() {
  revalidatePath("/admin/academy/resources");
  revalidatePath("/academy");
}

function readLink(formData: FormData): string {
  const value = String(formData.get("href") ?? "").trim();

  if (!value) {
    throw new Error("A resource needs a link.");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Link must be a full URL, e.g. https://example.com/guide");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Link must start with http:// or https://");
  }

  return parsed.toString();
}

export async function createResource(formData: FormData) {
  const user = await authorize();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("A resource needs a title.");

  // New resources go to the bottom of the list.
  const last = await prisma.academyResource.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.academyResource.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      href: readLink(formData),
      sortOrder: (last?.sortOrder ?? 0) + 1,
      isPublished: false,
      createdById: user.id,
    },
  });

  refresh();
}

export async function updateResource(formData: FormData) {
  await authorize();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Resource ID is missing.");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("A resource needs a title.");

  await prisma.academyResource.update({
    where: { id },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      href: readLink(formData),
    },
  });

  refresh();
}

export async function deleteResource(formData: FormData) {
  await authorize();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Resource ID is missing.");

  await prisma.academyResource.delete({ where: { id } });

  refresh();
}

export async function toggleResourcePublished(formData: FormData) {
  await authorize();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Resource ID is missing.");

  const resource = await prisma.academyResource.findUnique({
    where: { id },
    select: { isPublished: true },
  });

  if (!resource) throw new Error("Resource not found.");

  await prisma.academyResource.update({
    where: { id },
    data: { isPublished: !resource.isPublished },
  });

  refresh();
}

/**
 * Swaps a resource with its neighbour. Swapping the two `sortOrder` values
 * keeps the sequence stable without renumbering the whole list.
 */
export async function moveResource(formData: FormData) {
  await authorize();

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");

  if (!id || (direction !== "up" && direction !== "down")) {
    throw new Error("Invalid move.");
  }

  const current = await prisma.academyResource.findUnique({
    where: { id },
    select: { id: true, sortOrder: true },
  });

  if (!current) throw new Error("Resource not found.");

  const neighbour = await prisma.academyResource.findFirst({
    where:
      direction === "up"
        ? { sortOrder: { lt: current.sortOrder } }
        : { sortOrder: { gt: current.sortOrder } },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
    select: { id: true, sortOrder: true },
  });

  // Already at the end of the list.
  if (!neighbour) return;

  await prisma.$transaction([
    prisma.academyResource.update({
      where: { id: current.id },
      data: { sortOrder: neighbour.sortOrder },
    }),
    prisma.academyResource.update({
      where: { id: neighbour.id },
      data: { sortOrder: current.sortOrder },
    }),
  ]);

  refresh();
}
