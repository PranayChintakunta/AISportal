import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { StatCard } from "@/components/admin/stat-card";
import { EventRow } from "@/components/admin/event-row";
import { Button } from "@/components/ui/button";
import { eventStats, adminEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "AIS Admin — Events",
  description: "Manage AIS events, RSVPs, and check-ins.",
};

export default function AdminEventsPage() {
  return (
      <div className="flex min-h-screen w-full bg-cream">
        <AdminSidebar active="Events" role="Officer" />

        <div className="flex h-full flex-1 flex-col gap-[20px] p-[46px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[32px] font-bold leading-[34.56px] tracking-[-0.4px] text-ink [font-variation-settings:'wdth'_100]">
              Events
            </h2>
            <div className="flex items-center gap-[10px]">
              <Button variant="soft" size="sm" className="rounded-[8px]">
                List
              </Button>
              <Button variant="ghost" size="sm" className="rounded-[8px]">
                Calendar
              </Button>
              <Button variant="primary" size="md">
                + New Event
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex w-full gap-[16px]">
            {eventStats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Event list */}
          <div className="flex w-full flex-col gap-[12px]">
            {adminEvents.map((e) => (
              <EventRow key={e.title} {...e} />
            ))}
          </div>

          {/* Create CTA */}
          <div className="flex w-full items-center justify-between rounded-[16px] bg-brand px-[23px] py-[21px]">
            <span className="font-display text-[17px] font-semibold leading-[21.25px] text-white [font-variation-settings:'wdth'_100]">
              + Create a new event
            </span>
            <span className="font-mono text-[12px] leading-[16.8px] tracking-[0.2px] text-[#dfe6ff]">
              title · date · location · capacity · tags
            </span>
          </div>
        </div>
      </div>
  );
}
