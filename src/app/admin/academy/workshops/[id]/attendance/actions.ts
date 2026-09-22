"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { AttendanceMethod } from "@prisma/client";
import { canManageAcademy } from "@/lib/roles";

export async function checkInUserLive(workshopId: string, userId: string) {
  try {
    const actor = await getAuthenticatedUser();

    if (!actor || !canManageAcademy(actor.role, actor.team)) {
      return { success: false, error: "Unauthorized to manage workshop attendance." };
    }

    await prisma.attendance.upsert({
      where: {
        userId_workshopId: {
          userId,
          workshopId,
        },
      },
      update: {
        checkedInAt: new Date(),
        method: AttendanceMethod.MANUAL,
      },
      create: {
        userId,
        workshopId,
        checkedInAt: new Date(),
        method: AttendanceMethod.MANUAL,
      },
    });

    revalidatePath(`/admin/academy/workshops/${workshopId}/attendance`);
    return { success: true };
  } catch (error) {
    console.error("Manual check-in error:", error);
    return { success: false, error: "Failed to check in user." };
  }
}