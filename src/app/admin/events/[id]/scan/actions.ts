"use server";

import { prisma } from "@/lib/prisma";

export async function processCheckIn(eventId: string, qrToken: string) {
  try {
    // 1. Find the RSVP using the eventId and the scanned token
    const rsvp = await prisma.rSVP.findFirst({
      where: { 
        eventId: eventId,
        qrToken: qrToken,
      },
      include: { 
        user: { include: { profile: true } }, 
        attendance: true 
      },
    });

    // 2. Validation Checks
    if (!rsvp) {
      return { success: false, error: "Invalid QR code or wrong event." };
    }

    if (rsvp.attendance) {
      return { success: false, error: "User is already checked in!" };
    }

    if (rsvp.qrExpiresAt && rsvp.qrExpiresAt < new Date()) {
      return { success: false, error: "QR code has expired." };
    }

    // 3. Create the Attendance Record
    await prisma.attendance.create({
      data: {
        rsvpId: rsvp.id,
        method: "QR_SCAN",
        qrTokenUsed: qrToken,
      },
    });

    // Determine the user's name to show on the success screen
    const name = rsvp.user.profile 
      ? `${rsvp.user.profile.firstName} ${rsvp.user.profile.lastName}`
      : rsvp.user.email;

    return { success: true, message: `Checked in ${name} successfully!` };
    
  } catch (error) {
    console.error("Check-in error:", error);
    return { success: false, error: "Server error during check-in." };
  }
}