"use client";

import { useEffect, useState } from "react";
import { Tag } from "@/components/ui/tag";
import { EventGridCard } from "@/components/events/event-grid-card";
import { MobileScreen } from "@/components/mobile/ui/MobileScreen";
import { BottomNav } from "@/components/mobile/ui/BottomNav";
import { eventFilterTags } from "@/lib/data";
import { normalizeEventTags } from "@/lib/event-tags";

type EventRecord = {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  tags: string[];
};

// Formats date cleanly (e.g., "Oct 24 · 5:30 PM")
function formatEventDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date).replace(", ", " · ");
}

function EventCardSkeleton() {
  return (
    <div className="flex flex-col gap-[12px] rounded-[14px] border border-border-soft bg-white p-[16px] shadow-sm">
      {/* Fake Title */}
      <div className="h-[20px] w-[60%] animate-pulse rounded-[6px] bg-[#efece3]" />
      {/* Fake Meta (Date/Location) */}
      <div className="h-[14px] w-[40%] animate-pulse rounded-[4px] bg-[#f4f1ea]" />
      {/* Fake Description Lines */}
      <div className="mt-[4px] flex flex-col gap-[8px]">
        <div className="h-[12px] w-full animate-pulse rounded-[4px] bg-[#f4f1ea]" />
        <div className="h-[12px] w-[85%] animate-pulse rounded-[4px] bg-[#f4f1ea]" />
      </div>
      {/* Fake Tags */}
      <div className="mt-[4px] flex gap-[6px]">
        <div className="h-[24px] w-[60px] animate-pulse rounded-full bg-[#efece3]" />
        <div className="h-[24px] w-[80px] animate-pulse rounded-full bg-[#efece3]" />
      </div>
    </div>
  );
}

export function MobileEventsBrowse() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/events", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load events: ${response.status}`);
        }
        const payload = (await response.json()) as EventRecord[];
        setEvents(Array.isArray(payload) ? payload : []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Unable to load events at this time.");
          setEvents([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadEvents();
    return () => controller.abort();
  }, []);

  const filteredEvents = activeFilter
    ? events.filter((event) =>
        event.tags.some((tag) => tag.toLowerCase() === activeFilter.toLowerCase())
      )
    : events;

  return (
    <MobileScreen>
      <div className="flex flex-col gap-[6px]">
        <h1 className="font-mobile-display text-[24px] font-bold tracking-tight text-ink">
          Pick Your Next Sidequest
        </h1>
        <p className="font-mobile-body text-[14px] text-ink-muted">
          Join us to learn, build, and connect with the AIS community.
        </p>
      </div>

      {/* Filter pills - scrollbar hidden for cleaner mobile UX */}
      <div className="-mx-[20px] flex snap-x snap-mandatory gap-[8px] overflow-x-auto px-[20px] py-[4px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          aria-pressed={activeFilter === null}
          onClick={() => setActiveFilter(null)}
          className={`shrink-0 snap-start rounded-full px-[16px] py-[8px] font-mobile-body text-[13px] font-bold transition-all duration-200 ${
            activeFilter === null
              ? "bg-brand text-white shadow-sm"
              : "border border-border-soft bg-white text-ink-muted hover:bg-stone-soft"
          }`}
        >
          All Events
        </button>
        {eventFilterTags.map((t) => (
          <button
            key={t.label}
            type="button"
            aria-pressed={activeFilter === t.label}
            onClick={() => setActiveFilter(t.label)}
            className="shrink-0 snap-start transition-transform active:scale-95"
          >
            {activeFilter === t.label ? (
              <Tag label={t.label} bg={t.bg} color={t.color} className="ring-2 ring-brand/30 ring-offset-2 ring-offset-cream" />
            ) : (
              <Tag label={t.label} bg={t.bg} color={t.color} className="opacity-75 transition-opacity hover:opacity-100" />
            )}
          </button>
        ))}
      </div>

      {/* Event grid */}
      <div className="grid grid-cols-1 gap-[16px]">
        {loading ? (
          <>
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-danger-border bg-white p-[32px] text-center">
            <p className="font-mobile-display text-[16px] font-bold text-danger-ink">Oops!</p>
            <p className="mt-[4px] font-mobile-body text-[14px] text-ink-muted">{error}</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventGridCard
              key={event.id}
              title={event.title}
              meta={`${formatEventDate(event.startTime)} · ${event.location}`}
              description={event.description}
              tags={normalizeEventTags(event.tags)}
              eventId={event.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[14px] border border-dashed border-border-soft bg-white p-[40px] text-center shadow-sm">
            <p className="font-mobile-display text-[16px] font-bold text-ink">
              No events found
            </p>
            <p className="mt-[6px] font-mobile-body text-[14px] text-ink-muted">
              {activeFilter
                ? `We couldn't find any upcoming events tagged "${activeFilter}".`
                : "There are no upcoming events right now. Check back later!"}
            </p>
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="mt-[16px] rounded-full bg-brand-soft px-[16px] py-[8px] font-mobile-body text-[13px] font-bold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </MobileScreen>
  );
}