import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (
    !user ||
    (user.role !== "EXECUTIVE" &&
      user.role !== "DIRECTOR")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fieldsRaw = searchParams.get("fields");

  if (!fieldsRaw) {
    return new NextResponse("No export fields specified", { status: 400 });
  }

  const selectedFields: string[] = JSON.parse(fieldsRaw);

  // Fetch all members with all related schema relations included
  const members = await prisma.user.findMany({
    include: {
      profile: true,
      memberships: true,
      rsvps: {
        include: { event: true },
        orderBy: { createdAt: "desc" },
      },
      attendances: {
        include: { event: true, workshop: true },
        orderBy: { checkedInAt: "desc" },
      },
      submissions: {
        include: { application: true },
        orderBy: { submittedAt: "desc" },
      },
      drafts: {
        include: { application: true },
      },
      quizAttempts: {
        include: { quiz: { include: { workshop: true } } },
        orderBy: { submittedAt: "desc" },
      },
      videoProgress: {
        include: { workshop: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const FIELD_LABELS: Record<string, string> = {
    // User Account Info
    "user.id": "User ID",
    "user.email": "Email",
    "user.role": "Role",
    "user.team": "Team",
    "user.ticketToken": "Ticket Token",
    "user.verifiedAt": "Verified At",
    "user.lastLoginAt": "Last Login At",
    "user.createdAt": "Account Created At",
    // Personal Info
    "profile.firstName": "First Name",
    "profile.lastName": "Last Name",
    "profile.middleName": "Middle Name",
    "profile.prefName": "Preferred Name",
    // Contact
    "profile.personalEmail": "Personal Email",
    "profile.utdEmail": "UTD Email",
    "profile.utdNetId": "UTD NetID",
    "profile.phoneNumber": "Phone Number",
    // Academic & Links
    "profile.degree": "Degree",
    "profile.major": "Major",
    "profile.year": "Year",
    "profile.githubUrl": "GitHub URL",
    "profile.linkedinUrl": "LinkedIn URL",
    "profile.portfolioUrl": "Portfolio URL",
    "profile.profileCompletionStatus": "Profile Status",
    // Relations & Activity
    "memberships": "Memberships",
    "rsvps": "RSVP'd Events",
    "attendances": "Attended Events & Workshops",
    "submissions": "Submitted Applications",
    "drafts": "Application Drafts",
    "quizAttempts": "Quiz Attempts",
    "videoProgress": "Workshop Video Progress",
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

  const csvRows = members.map((member) => {
    return selectedFields.map((fieldKey) => {
      let rawVal: unknown = "";

      if (fieldKey.startsWith("profile.")) {
        const path = fieldKey.replace(/^profile\./, "");
        rawVal = getNestedValue(member.profile, path);
      } else if (fieldKey.startsWith("user.")) {
        const path = fieldKey.replace(/^user\./, "");
        rawVal = getNestedValue(member, path);
      } else if (fieldKey === "memberships") {
        rawVal = member.memberships
          .map((m) => `${m.membershipType}${m.activeFlag ? " (Active)" : ""}`)
          .join("; ");
      } else if (fieldKey === "rsvps") {
        rawVal = member.rsvps
          .map((r) => `${r.event?.title || "Event"} [${r.status}]`)
          .join("; ");
      } else if (fieldKey === "attendances") {
        rawVal = member.attendances
          .map((a) => {
            const name = a.event?.title || a.workshop?.title || "Unknown Session";
            return `${name} (${a.method || "Check-in"})`;
          })
          .join("; ");
      } else if (fieldKey === "submissions") {
        rawVal = member.submissions
          .map((s) => `${s.application?.title || "Application"} [${s.status}]`)
          .join("; ");
      } else if (fieldKey === "drafts") {
        rawVal = member.drafts
          .map((d) => `${d.application?.title || "Application"} (Step ${d.stepIndex})`)
          .join("; ");
      } else if (fieldKey === "quizAttempts") {
        rawVal = member.quizAttempts
          .map((q) => {
            const wTitle = q.quiz?.workshop?.title || "Quiz";
            return `${wTitle}: ${q.score}% (${q.passed ? "Passed" : "Failed"})`;
          })
          .join("; ");
      } else if (fieldKey === "videoProgress") {
        rawVal = member.videoProgress
          .map((v) => {
            const wTitle = v.workshop?.title || "Workshop";
            return `${wTitle}: ${v.completed ? "Completed" : `${v.watchedSeconds}s watched`}`;
          })
          .join("; ");
      } else {
        rawVal = getNestedValue(member, fieldKey);
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

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = now
    .toLocaleTimeString("en-US", {
      timeZone: "America/Chicago",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/[: ]/g, "-"); // Replaces colons and spaces with hyphens

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ais_members_export_${dateStr}_${timeStr}.csv"`,
    },
  })
};