import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { UpNextCard } from "@/components/dashboard/up-next-card";
import { getNextUpcomingRsvp, formatDaysAway, formatEventDate } from "@/lib/dashboard-utils";
import { AchievementsCard } from "@/components/dashboard/achievements-card";
import { QuickCtaCard } from "@/components/dashboard/quick-cta-card";
import { AnnouncementsCard } from "@/components/dashboard/announcements-card";
import { MobileDashboard } from "@/components/mobile/dashboard/MobileDashboard";
import {
  DashboardStatusStrip,
  StatusStripSkeleton,
  DashboardApplicationsCard,
  ApplicationsCardSkeleton,
  DashboardRsvpsCard,
  RsvpsCardSkeleton,
  DashboardRecommendedCard,
} from "@/components/dashboard/server-cards";
import {
  upNextTags,
  achievements,
  recommended,
  announcements,
} from "@/lib/data";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/onboarding");
  }

  let user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });

  if (!user) {
    // Fallback: Lazy create the user if the Clerk webhook didn't fire (common in local dev)
    const email = clerkUser.emailAddresses[0]?.emailAddress || "no-email@example.com";
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: email,
        role: "MEMBER",
      }
    });
  }

  const nextRsvp = await getNextUpcomingRsvp(user.id);

  return (
    <>
      <div className="md:hidden">
        <MobileDashboard userId={user.id} nextRsvp={nextRsvp} announcements={announcements} />
      </div>

      <div className="hidden md:block">
        <div className="flex min-h-screen w-full flex-col bg-cream">
          <Navbar />

          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[28px] px-[46px] pb-[46px] pt-[45px]">
            <h1 className="font-display text-[40px] font-bold leading-[43.2px] tracking-[-0.4px] text-brand [font-variation-settings:'wdth'_100]">
              Welcome back, Member! :)
            </h1>


            {/* Row 1 — featured event + applications */}
            <div className="flex flex-col gap-[24px] xl:flex-row xl:items-start mt-[28px]">
              {nextRsvp ? (
                <UpNextCard
                  eyebrow={`Up next · ${formatDaysAway(nextRsvp.event.startTime)}`}
                  title={nextRsvp.event.title}
                  dateLines={[formatEventDate(nextRsvp.event.startTime), nextRsvp.event.location]}
                  tags={[{ label: "RSVP'd", bg: "#e1e8ff", color: "#1f3aa3" }]}
                  qrToken={nextRsvp.qrToken}
                />
              ) : (
                <UpNextCard
                  isEmpty={true}
                  eyebrow="Up next"
                  title="No RSVPs yet"
                  dateLines={["Check out upcoming events and RSVP to see them here."]}
                />
              )}
              <Suspense fallback={<ApplicationsCardSkeleton />}>
                <DashboardApplicationsCard userId={user.id} />
              </Suspense>
            </div>

            {/* Row 2 — announcements + rsvps + cta */}
            <div className="flex flex-col gap-[24px] xl:flex-row xl:items-stretch xl:h-[268px]">
              <AnnouncementsCard items={announcements} />
              <Suspense fallback={<RsvpsCardSkeleton />}>
                <DashboardRsvpsCard userId={user.id} />
              </Suspense>
              <QuickCtaCard />
            </div>

            {/* Row 3 — recommendations + announcements */}
            <div className="flex flex-col gap-[24px] xl:flex-row xl:items-start">
              <Suspense fallback={<div className="flex flex-1 min-h-[150px] items-center justify-center bg-white rounded-2xl">Loading recommendations...</div>}>
                <DashboardRecommendedCard userId={user.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
