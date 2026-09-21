import { getAuthenticatedUser } from "@/lib/auth";
import { UserQrPass } from "@/components/qr-pass/user-qr-pass";
import { GradientWavesBackground } from "@/components/gradient-waves-background";
import { BackButton } from "@/components/ui/back-button";

export default async function QuickTicketPage() {
  const session = await getAuthenticatedUser();

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-4 text-center">
        <p className="text-sm font-semibold text-slate-700">
          You do not have an account. Please sign in or create one.
        </p>
      </div>
    );
  }

  const token = session.ticketToken;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-4 text-center">
        <p className="text-sm font-semibold text-slate-700">
          No ticket pass found for this account.
        </p>
      </div>
    );
  }

  // 1. Resolve Display Name
  const displayName = session.profile?.firstName
    ? session.profile.prefName
      ? `${session.profile.prefName} ${session.profile.lastName}`
      : `${session.profile.firstName} ${session.profile.lastName}`
    : session.email || "AIS Member";

  // 2. Resolve Active Membership Status & Primary Membership Type
  // Checks session.memberships array (derived from Prisma model Membership)
  const userMemberships = session.memberships || [];
  
  // A member is active if at least one membership record has activeFlag === true
  const activeMembership = userMemberships.find((m) => m.activeFlag === true);
  const isActiveMember = Boolean(activeMembership);

  // Pick the active membership type, or fallback to the most recent membership recorded
  const primaryMembershipType = activeMembership?.membershipType ?? userMemberships[0]?.membershipType;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <BackButton />
      <GradientWavesBackground />
      <UserQrPass
        ticketToken={token}
        userName={displayName}
        email={session.email || session.profile?.utdEmail || undefined}
        membershipType={primaryMembershipType}
        isActiveMember={isActiveMember}
      />
    </div>
  );
}