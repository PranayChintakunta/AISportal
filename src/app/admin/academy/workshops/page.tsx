export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AcademyTabs } from "@/components/admin/academy-tabs";
import { StatCard } from "@/components/admin/stat-card";
import { EventRow, type EventRowData } from "@/components/admin/event-row";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "AIS Admin — Academy Workshops",
  description: "Manage AI Academy workshops, recordings, and quizzes.",
};

type WorkshopWithRsvps = Prisma.EventGetPayload<{
  include: {
    rsvps: { include: { attendance: true } };
    workshopContent: {
      select: { recordingUrl: true; quiz: { select: { isPublished: true } } };
    };
  };
}>;

function toDisplayStatus(event: { startTime: Date; endTime: Date; isPublished: boolean }) {
  if (!event.isPublished) {
    return { label: "Draft", bg: "#f3f4f6", color: "#4b5563" };
  }
  const now = new Date();
  if (now < new Date(event.startTime)) return { label: "Upcoming", bg: "#e1e8ff", color: "#1f3aa3" };
  if (now > new Date(event.endTime)) return { label: "Past", bg: "#efece3", color: "#8a8a93" };
  return { label: "Live", bg: "#d2ecd9", color: "#2c5d3e" };
}

function mapWorkshopToRow(workshop: WorkshopWithRsvps): EventRowData {
  const now = new Date();
  const isPast = new Date(workshop.endTime) < now;

  const activeRsvps = workshop.rsvps.filter((rsvp) => rsvp.status !== "CANCELED");
  const checkedIn = activeRsvps.filter((rsvp) => Boolean(rsvp.attendance)).length;
  const capacity = workshop.capacity ?? 0;
  const progress = capacity > 0 ? Math.round((checkedIn / capacity) * 100) : 0;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(workshop.startTime));

  // A past workshop missing its replay or quiz is the thing an Academy officer
  // most needs to notice, so both are surfaced in place of the check-in count.
  const hasRecording = Boolean(workshop.workshopContent?.recordingUrl);
  const quiz = workshop.workshopContent?.quiz;
  const quizLabel = !quiz ? "no quiz" : quiz.isPublished ? "quiz live" : "quiz unpublished";

  const leftInfo = isPast
    ? `${checkedIn} attended · ${hasRecording ? "recording added" : "no recording yet"} · ${quizLabel}`
    : capacity > 0
      ? `${checkedIn} / ${capacity} checked in · ${quizLabel}`
      : `No capacity set · ${quizLabel}`;

  return {
    id: workshop.id,
    imageUrl: workshop.imageUrl,
    title: workshop.title,
    status: toDisplayStatus(workshop),
    meta: `${formattedDate} · ${workshop.location}`,
    leftInfo,
    rightInfo: `${activeRsvps.length} RSVPs`,
    progress,
    progressFill: isPast ? "#8a8a93" : "#2f5fe8",
    dim: isPast,
    // RSVPs, QR and scanning are event-level features that already work, so
    // these point at the existing pages rather than duplicating them.
    actions: [
      { label: "QR", variant: "primary", href: `/admin/events/${workshop.id}/check-in` },
      { label: "Scan", variant: "primary", href: `/admin/events/${workshop.id}/scan` },
      { label: "RSVPs", variant: "accent", href: `/admin/events/${workshop.id}/rsvps` },
      { label: "Quiz", variant: "accent", href: `/admin/academy/workshops/${workshop.id}/quiz` },
      { label: "Edit", variant: "ghost", href: `/admin/academy/workshops/${workshop.id}/edit` },
    ],
  };
}

async function getWorkshopViewModel() {
  const now = new Date();

  const workshops = await prisma.event.findMany({
    where: { programs: { has: "AI_ACADEMY" } },
    orderBy: { startTime: "asc" },
    include: {
      rsvps: { include: { attendance: true } },
      workshopContent: {
        select: { recordingUrl: true, quiz: { select: { isPublished: true } } },
      },
    },
  });

  const published = workshops.filter((w) => w.isPublished);
  const drafts = workshops.filter((w) => !w.isPublished);

  const live = published.filter(
    (w) => new Date(w.startTime) <= now && new Date(w.endTime) >= now
  );
  const upcoming = published.filter((w) => new Date(w.startTime) > now);
  const past = published.filter((w) => new Date(w.endTime) < now);

  const upcomingRsvps = workshops
    .filter((w) => new Date(w.endTime) >= now)
    .reduce(
      (sum, w) => sum + w.rsvps.filter((rsvp) => rsvp.status !== "CANCELED").length,
      0
    );

  // Replaces the events list's "avg capacity": for Academy the useful signal is
  // whether past workshops actually have a replay posted.
  const withRecording = past.filter((w) => Boolean(w.workshopContent?.recordingUrl)).length;
  const recordingCoverage =
    past.length > 0 ? Math.round((withRecording / past.length) * 100) : 0;

  return {
    stats: [
      { value: String(published.length), label: "published" },
      { value: String(drafts.length), label: "drafts" },
      { value: String(upcomingRsvps), label: "upcoming RSVPs" },
      { value: `${recordingCoverage}%`, label: "recordings posted", highlight: true },
    ],
    publishedRows: [...live, ...upcoming].map(mapWorkshopToRow),
    draftRows: drafts.map(mapWorkshopToRow),
    pastRows: past.map(mapWorkshopToRow),
  };
}

export default async function AdminAcademyWorkshopsPage() {
  const data = await getWorkshopViewModel();

  return (
    <div className="flex min-h-screen w-full bg-cream">
      <AdminSidebar active="Academy" />

      <div className="flex h-full flex-1 flex-col gap-[28px] p-[46px]">
        <AcademyTabs active="Workshops" />

        <div className="flex items-center justify-between">
          <h2 className="style-section-header leading-[34.56px] tracking-[-0.4px] text-ink [font-variation-settings:'wdth'_100]">
            Workshops
          </h2>
          <div className="flex items-center gap-[10px]">
            <Link href="/admin/academy/workshops/new">
              <Button variant="primary" size="md">
                + New Workshop
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex w-full gap-[16px]">
          {data.stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="flex flex-col gap-[12px]">
          <h3 className="style-section-header text-ink">
            Published Workshops ({data.publishedRows.length})
          </h3>
          {data.publishedRows.length > 0 ? (
            data.publishedRows.map((w) => <EventRow key={w.id} {...w} />)
          ) : (
            <p className="rounded-xl border border-dashed border-border-soft p-4 text-center style-caption text-ink-faint">
              No active or upcoming published workshops.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-[12px] pt-4">
          <h3 className="style-section-header text-ink">
            Drafts ({data.draftRows.length})
          </h3>
          {data.draftRows.length > 0 ? (
            data.draftRows.map((w) => <EventRow key={w.id} {...w} />)
          ) : (
            <p className="rounded-xl border border-dashed border-border-soft p-4 text-center style-caption text-ink-faint">
              No draft workshops saved.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-[12px] pt-4">
          <h3 className="style-section-header text-ink-muted">
            Past Workshops ({data.pastRows.length})
          </h3>
          {data.pastRows.length > 0 ? (
            <div className="flex flex-col gap-[12px]">
              {data.pastRows.map((w) => <EventRow key={w.id} {...w} />)}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border-soft p-4 text-center style-caption text-ink-faint">
              No past workshops recorded.
            </p>
          )}
        </div>

        <Link href="/admin/academy/workshops/new" className="mt-2 block w-full">
          <div className="flex w-full items-center justify-between rounded-[16px] bg-brand px-[23px] py-[21px] transition-opacity hover:opacity-95">
            <span className="style-section-header leading-[21.25px] text-white [font-variation-settings:'wdth'_100]">
              + Create a new workshop
            </span>
            <span className="style-caption leading-[16.8px] tracking-[0.2px] text-white/80">
              title · date · location · recording · quiz
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
