import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { EventForm } from "@/components/admin/event-form";
import { CoverPhotoCard } from "@/components/admin/cover-photo-card";
import { SettingsCard } from "@/components/admin/settings-card";
import { Button } from "@/components/ui/button";
import { eventTags, eventSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "AIS Admin — Create Event",
  description: "Create and publish a new AIS event.",
};

export default function CreateEventPage() {
  return (
      <div className="flex min-h-screen w-full bg-cream">
        <AdminSidebar active="Events" role="Officer" />

        <div className="flex h-full flex-1 flex-col gap-[20px] p-[46px]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <a
                href="#"
                className="font-mono text-[12px] leading-[16.8px] tracking-[0.2px] text-brand"
              >
                ← Back to Events
              </a>
              <h2 className="mt-[6px] font-display text-[32px] font-bold leading-[34.56px] tracking-[-0.4px] text-ink [font-variation-settings:'wdth'_100]">
                Create Event
              </h2>
            </div>
            <div className="flex gap-[10px]">
              <Button variant="ghost" size="md">
                Save draft
              </Button>
              <Button variant="primary" size="md">
                Publish
              </Button>
            </div>
          </div>

          {/* Form + side panels */}
          <div className="flex w-full flex-col gap-[24px] lg:flex-row lg:items-start">
            <EventForm tags={eventTags} />
            <div className="flex w-full flex-col gap-[20px] lg:w-[382px] lg:shrink-0">
              <CoverPhotoCard />
              <SettingsCard items={eventSettings} />
            </div>
          </div>
        </div>
      </div>
  );
}
