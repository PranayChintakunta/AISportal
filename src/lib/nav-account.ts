import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { isApplicationReviewerOnly } from "@/lib/roles";

/** What the navbar needs about the signed-in user, resolved on the server. */
export type NavAccount = {
  /** Preferred name if set, else the legal first name. */
  firstName: string | null;
  role: string | null;
  isReviewerOnly: boolean;
};

export const getNavAccount = cache(async function getNavAccount(): Promise<NavAccount | null> {
  try {
    const session = await auth();
    if (!session.userId) return null;

    const user = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: {
        role: true,
        profile: { select: { firstName: true, prefName: true } },
        memberships: {
          where: { activeFlag: true },
          select: { membershipType: true },
        },
      },
    });

    if (!user) return null;

    const programs = user.memberships.map((m) => m.membershipType);

    return {
      firstName: user.profile ? user.profile.prefName || user.profile.firstName : null,
      role: user.role,
      isReviewerOnly: isApplicationReviewerOnly(user.role, programs),
    };
  } catch {
    return null;
  }
});
