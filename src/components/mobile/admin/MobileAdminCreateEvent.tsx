import Link from "next/link";
import { EventForm } from "@/components/admin/event-form";
import { CoverPhotoCard } from "@/components/admin/cover-photo-card";
import { SettingsCard, SettingRow } from "@/components/admin/settings-card";
import { MobileScreen } from "@/components/mobile/ui/MobileScreen";
import { MobileAdminNav } from "@/components/mobile/admin/MobileAdminNav";
import { eventTags } from "@/lib/data";
import { createEvent } from "@/app/admin/events/actions";
import { EventActionButtons } from "@/components/admin/admin-event-actions";

interface MobileAdminCreateEventProps {
  userRole?: string;
}

export function MobileAdminCreateEvent({userRole}: MobileAdminCreateEventProps) {

  // Build settings rows dynamically with initial values from the DB
  const dynamicSettings: SettingRow[] = [
    {
      label: "Allow RSVPs",
      type: "toggle",
      name: "isRsvpOpen", // Sent in formData as "true" or "false"
      defaultOn: true,
    },
    {
      label: "Event Visibility",
      type: "badge",
      badge: "Draft",
    },
  ];

  return (
    <MobileScreen withBottomNavPadding={false}>
      <MobileAdminNav active="Events" />

      <div>
        <Link href="/admin/events" className="style-caption text-brand">
          ← Back to Events
        </Link>
        <h2 className="mt-1.5 style-mobile-title text-ink">
          Create Event
        </h2>
      </div>

      <form 
        action={createEvent} 
        // encType="multipart/form-data" 
        className="flex flex-col gap-6"
      >
        <CoverPhotoCard defaultImageUrl={null} />
        <EventForm tags={eventTags} />
        <SettingsCard items={dynamicSettings} />

        <div className="flex flex-col gap-2.5">
          <EventActionButtons isPublished={false} userRole={userRole}/>
        </div>
      </form>
    </MobileScreen>
  );
}