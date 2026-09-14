import { auth } from "@clerk/nextjs/server";
import type { MembershipType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createErrorResponse } from "@/lib/api-error";
import { canReviewApplications, isAdminRole, reviewableProgramTypes } from "@/lib/roles";

export async function getAdminUser() {
  const session = await auth();
  if (!session.userId) {
    return { error: createErrorResponse("Unauthorized", "UNAUTHENTICATED", 401) } as const;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: session.userId },
    select: { id: true, role: true },
  });

  if (!user || !isAdminRole(user.role)) {
    return { error: createErrorResponse("Forbidden", "FORBIDDEN", 403) } as const;
  }

  return { user } as const;
}

export async function getApplicationReviewer() {
  const session = await auth();
  if (!session.userId) {
    return { error: createErrorResponse("Unauthorized", "UNAUTHENTICATED", 401) } as const;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: session.userId },
    select: {
      id: true,
      role: true,
      memberships: {
        where: { activeFlag: true },
        select: { membershipType: true },
      },
    },
  });

  if (!user) {
    return { error: createErrorResponse("Forbidden", "FORBIDDEN", 403) } as const;
  }

  const programs: MembershipType[] = user.memberships.map((m) => m.membershipType);

  if (!canReviewApplications(user.role, programs)) {
    return { error: createErrorResponse("Forbidden", "FORBIDDEN", 403) } as const;
  }

  return {
    user: { id: user.id, role: user.role },
    programs,
    allowedProgramTypes: reviewableProgramTypes(user.role, programs),
  } as const;
}

export function postingOutOfScopeResponse() {
  return createErrorResponse("Application not found", "NOT_FOUND", 404);
}
