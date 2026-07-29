"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateEvent(formData: FormData) {
  const id = formData.get("id") as string;
  
  // Extract and parse form fields
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  
  const capacityStr = formData.get("capacity") as string;
  const capacity = capacityStr ? parseInt(capacityStr, 10) : null;
  
  const status = formData.get("status") as string;
  const visibility = formData.get("visibility") as string;
  
  // Tags come through as a comma-separated string from the hidden input in your EventForm
  const tagsString = formData.get("tags") as string;
  
  // 4. Added .filter(Boolean) so it doesn't accidentally save an empty string `[""]`
  const tags = tagsString ? tagsString.split(",").filter(Boolean) : [];

  await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      location,
      startTime,
      endTime,
      capacity,
      // Bypass strict Enum checks by casting to any
      status: status as any,
      visibility: visibility as any,
      
      // If tags is a simple String[] in your schema, this works.
      tags: tags as any,
    },
  });

  // Clear the cache for the admin events page so the updated data shows immediately
  revalidatePath("/admin/events");
  
  // Redirect back to the events list
  redirect("/admin/events");
}