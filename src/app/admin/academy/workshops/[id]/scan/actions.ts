"use server";

import { prisma } from "@/lib/prisma";
import { AttendanceMethod } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";

export async function processWorkshopScan(
  workshopId: string, 
  qrToken: string, // User's ticketToken
  // scanType: "attendance" | "item" = "attendance", 
) {
  try {
    // 1. Get the authenticated admin performing the scan
    const currentUser = await getAuthenticatedUser();

    if (!currentUser || currentUser.role === "MEMBER" || (currentUser.role === "OFFICER" && currentUser.team !== "AI_ACADEMY")) {
      return { success: false, error: "Unauthorized. Please sign in as an officer or mentor." };
    }

    // 2. Lookup workshop existence
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      select: { id: true, title: true },
    });

    if (!workshop) {
      return { success: false, error: "Workshop not found." };
    }

    // 3. Find the user by their ticketToken (checking User model, or fallback to Profile)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { ticketToken: qrToken },
        ]
      },
      include: { profile: true },
    });

    if (!user) {
      return { success: false, error: "Invalid ticket QR code." };
    }

    const name = user.profile 
      ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
      : user.email;

    // 4. Handle Workshop Check-In
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_workshopId: {
          userId: user.id,
          workshopId: workshop.id,
        },
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        error: `${name} is already checked in to this workshop!`,
      };
    }

    // 5. Create Attendance record
    await prisma.attendance.create({
      data: {
        workshopId: workshop.id,
        userId: user.id,
        method: AttendanceMethod.OFFICER_TICKET_SCAN,
        qrTokenUsed: qrToken,
      },
    });

    return {
      success: true,
      message: `Checked in: ${name}`,
    };
  } catch (error) {
    console.error("Workshop scan error:", error);
    return { success: false, error: "Server error during scan." };
  }
}