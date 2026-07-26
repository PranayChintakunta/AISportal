import { Navbar } from "@/components/navbar";
import { StatusStrip } from "@/components/dashboard/status-strip";
import { UpNextCard } from "@/components/dashboard/up-next-card";
import { ApplicationsCard } from "@/components/dashboard/applications-card";
import { RsvpsCard } from "@/components/dashboard/rsvps-card";
import { AchievementsCard } from "@/components/dashboard/achievements-card";
import { QuickCtaCard } from "@/components/dashboard/quick-cta-card";
import { RecommendedCard } from "@/components/dashboard/recommended-card";
import { AnnouncementsCard } from "@/components/dashboard/announcements-card";
import { MobileDashboard } from "@/components/mobile/dashboard/MobileDashboard";
import {
  statusStats,
  upNextTags,
  applications,
  rsvps,
  achievements,
  recommended,
  announcements,
} from "@/lib/data";

export default function DashboardPage() {
  return (
    <>
      <div className="md:hidden">
        <MobileDashboard />
      </div>

      <div className="hidden md:block">
        <div className="flex min-h-screen w-full flex-col bg-cream">
          <Navbar />

          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[28px] px-[46px] pb-[46px] pt-[45px]">
            <h1 className="font-display text-[40px] font-bold leading-[43.2px] tracking-[-0.4px] text-brand [font-variation-settings:'wdth'_100]">
              Welcome back, Member! :)
            </h1>

            <StatusStrip stats={statusStats} />

            {/* Row 1 — featured event + applications */}
            <div className="flex flex-col gap-[24px] xl:flex-row xl:items-start">
              <UpNextCard
                eyebrow="Up next · in 3 days"
                title="Fall Kickoff"
                dateLines={["Aug 27, 2026 · 7:00 PM", "ECSW 1.315"]}
                tags={upNextTags}
              />
              <ApplicationsCard items={applications} />
            </div>

            {/* Row 2 — rsvps + achievements + cta */}
            <div className="flex flex-col gap-[24px] xl:flex-row xl:items-start">
              <RsvpsCard items={rsvps} />
              <AchievementsCard tiles={achievements} />
              <QuickCtaCard />
            </div>

            {/* Row 3 — recommendations + announcements */}
            <div className="flex flex-col gap-[24px] xl:flex-row xl:items-start">
              <RecommendedCard items={recommended} />
              <AnnouncementsCard items={announcements} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
