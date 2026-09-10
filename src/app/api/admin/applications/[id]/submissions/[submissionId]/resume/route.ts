import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApplicationReviewer, postingOutOfScopeResponse } from "@/lib/admin-app-auth";
import { canReviewProgramType } from "@/lib/roles";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    // Was a flat "role must not be MEMBER" check, which would lock out AIM
    // mentors — they review with role MEMBER and an AIM_MENTOR membership.
    const reviewer = await getApplicationReviewer();
    if ("error" in reviewer) return reviewer.error;

    const { submissionId } = await ctx.params;

    const submission = await prisma.applicationSubmission.findUnique({
      where: { id: submissionId },
      include: {
        application: { select: { programType: true } },
        user: {
          include: {
            profile: {
              include: { resumeFile: true },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Resume file not found" }, { status: 404 });
    }

    // Scope against the submission's own posting, not the id in the URL.
    if (!canReviewProgramType(reviewer.allowedProgramTypes, submission.application.programType)) {
      return postingOutOfScopeResponse();
    }

    const file = submission.user?.profile?.resumeFile;

    if (!file?.storageKey) {
      return NextResponse.json({ error: "Resume file not found" }, { status: 404 });
    }

    const publicBase = (
      process.env.R2_PUBLIC_URL ?? 
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? 
      ""
    ).replace(/\/$/, "");

    const fileUrl = `${publicBase}/${file.storageKey}`;
    return NextResponse.redirect(fileUrl);

  } catch (error) {
    console.error("Resume retrieval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}