import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (
    !user ||
    (user.role !== "EXECUTIVE" &&
      user.role !== "DIRECTOR")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: eventId } = await params;
  const { searchParams } = new URL(req.url);
  const fieldsRaw = searchParams.get("fields");

  if (!fieldsRaw) {
    return new NextResponse("No export fields specified", { status: 400 });
  }

  const selectedFields: string[] = JSON.parse(fieldsRaw);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      title: true,
      rsvps: {
        where: { status: "GOING" },
        include: {
          attendance: true,
          user: {
            include: { profile: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  const FIELD_LABELS: Record<string, string> = {
    "profile.firstName": "First Name",
    "profile.lastName": "Last Name",
    "profile.middleName": "Middle Name",
    "profile.prefName": "Preferred Name",
    "user.email": "Email",
    "profile.personalEmail": "Personal Email",
    "profile.utdNetId": "UTD NetID",
    "profile.phoneNumber": "Phone Number",
    "profile.degree": "Degree",
    "profile.major": "Major",
    "profile.year": "Year",
    "profile.githubUrl": "GitHub URL",
    "profile.linkedinUrl": "LinkedIn URL",
    "profile.portfolioUrl": "Portfolio URL",
    "rsvp.status": "RSVP Status",
    "rsvp.createdAt": "RSVP Date",
    "rsvp.isWalkIn": "Walk-in",
    "attendance.checkedIn": "Checked In",
    "attendance.checkedInAt": "Check-in Time",
  };

  const csvHeaders = selectedFields.map((fieldKey) => {
    const label = FIELD_LABELS[fieldKey] ?? fieldKey;
    return `"${label.replace(/"/g, '""')}"`;
  });

  const getNestedValue = (obj: unknown, path: string): unknown => {
    return path.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object" && part in acc) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  const csvRows = event.rsvps.map((rsvp) => {
    return selectedFields.map((fieldKey) => {
      let rawVal: unknown = "";

      if (fieldKey === "attendance.checkedIn") {
        // Derived field: Yes/No based on whether an attendance record exists
        rawVal = rsvp.attendance !== null ? "Yes" : "No";
      } else if (fieldKey.startsWith("profile.")) {
        const path = fieldKey.replace(/^profile\./, "");
        rawVal = getNestedValue(rsvp.user?.profile, path);
      } else if (fieldKey.startsWith("user.")) {
        const path = fieldKey.replace(/^user\./, "");
        rawVal = getNestedValue(rsvp.user, path);
      } else if (fieldKey.startsWith("rsvp.")) {
        const path = fieldKey.replace(/^rsvp\./, "");
        rawVal = getNestedValue(rsvp, path);
      } else if (fieldKey.startsWith("attendance.")) {
        const path = fieldKey.replace(/^attendance\./, "");
        rawVal = getNestedValue(rsvp.attendance, path);
      }

      let strVal = "";
      if (rawVal !== null && rawVal !== undefined) {
        if (rawVal instanceof Date) {
          strVal = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Chicago",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          }).format(rawVal);
        } else if (typeof rawVal === "boolean") {
          strVal = rawVal ? "Yes" : "No";
        } else if (typeof rawVal === "object") {
          strVal = JSON.stringify(rawVal);
        } else {
          strVal = String(rawVal);
        }
      }

      return `"${strVal.replace(/"/g, '""')}"`;
    });
  });

  const csvContent = [
    csvHeaders.join(","),
    ...csvRows.map((r) => r.join(",")),
  ].join("\n");

  const safeName = event.title.replace(/[^a-z0-9]/gi, "_");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}_rsvps.csv"`,
    },
  });
}