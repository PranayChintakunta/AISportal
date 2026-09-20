"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { getUpNextWorkshop, isWorkshopPast, type Workshop } from "@/lib/academy-data";

type LessonStatus = "completed" | "now-playing" | "coming-up";

function getStatus(workshop: Workshop, nowPlayingId: string): LessonStatus {
  if (workshop.id === nowPlayingId) return "now-playing";
  return isWorkshopPast(workshop) ? "completed" : "coming-up";
}

const STATUS: Record<LessonStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-emerald-600 text-white" },
  "now-playing": { label: "Now Playing", className: "bg-[#2563eb] text-white" },
  "coming-up": { label: "Coming Up", className: "bg-[#d4af37] text-ink" },
};

export function CourseSequence({ workshops }: { workshops: Workshop[] }) {
  const nowPlaying = getUpNextWorkshop();
  const sequence = [...workshops].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="flex snap-x snap-mandatory gap-[20px] overflow-x-auto pb-[8px] scrollbar-none">
      {sequence.map((workshop, idx) => {
        const status = getStatus(workshop, nowPlaying.id);
        const { label, className } = STATUS[status];
        return (
          <Link
            key={workshop.id}
            href={`/academy/workshops/${workshop.id}`}
            className="w-[280px] shrink-0 snap-start"
          >
            <div className="flex h-full flex-col gap-[12px] rounded-[20px] border border-[#2a2f3a] bg-[#181c25] p-[14px] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#2563eb]/60">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[14px] border-[3px] border-[#d4af37] bg-[linear-gradient(135deg,#2f5fe8_0%,#434655_100%)]">
                <span className="flex size-[52px] items-center justify-center rounded-full bg-white shadow-md">
                  <Play className="h-5 w-5 fill-[#2563eb] text-[#2563eb]" />
                </span>
              </div>

              <div className="flex flex-col gap-[6px]">
                <h3 className="style-card-title text-white">
                  Lesson {idx + 1}: {workshop.title}
                </h3>
                <p className="style-caption text-white/70">{workshop.description}</p>
              </div>

              <span className={`w-fit rounded-full px-[12px] py-[6px] style-badge-text ${className}`}>
                {label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
