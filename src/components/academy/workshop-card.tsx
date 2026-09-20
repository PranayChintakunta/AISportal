"use client";

import Link from "next/link";
import { Calendar, MapPin, Check, X, PlayCircle } from "lucide-react";
import { isWorkshopPast, type Workshop } from "@/lib/academy-data";
import { formatEventDate } from "@/lib/utils";

function AttendanceBadge({ attendance }: { attendance?: Workshop["attendance"] }) {
  if (attendance === "attended") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-[#d2ecd9] px-3 py-1 style-badge-text text-emerald-900">
        <Check className="h-3.5 w-3.5" />
        Attended
      </span>
    );
  }
  if (attendance === "missed") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-red-300 bg-[#fdf2f2] px-3 py-1 style-badge-text text-red-700">
        <X className="h-3.5 w-3.5" />
        Missed
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#2563eb] px-3 py-1 style-badge-text text-white">
      Workshop
    </span>
  );
}

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const isPast = isWorkshopPast(workshop);

  return (
    <Link href={`/academy/workshops/${workshop.id}`} className="block h-full">
      <div className="flex h-full flex-col gap-[18px] rounded-[20px] border border-[#2a2f3a] bg-[#181c25] p-[22px] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#2563eb]/60">
        <div className="flex flex-wrap items-center gap-[8px]">
          <span className="whitespace-nowrap rounded-full bg-[#2563eb]/15 px-[12px] py-[6px] style-badge-text uppercase tracking-widest text-[#9db8ff]">
            {formatEventDate(workshop.startTime, true)}
          </span>
          <AttendanceBadge attendance={workshop.attendance} />
        </div>

        <div className="flex flex-col gap-[8px]">
          <h3 className="style-card-title text-white">{workshop.title}</h3>
          <p className="style-body-text text-white/70">{workshop.description}</p>
        </div>

        <div className="mt-auto flex flex-col gap-[10px] pt-[4px]">
          <div className="flex items-center justify-between style-caption text-white/60">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {workshop.location}
            </span>
            {!isPast && <span>{workshop.seatsAvailable} seats available</span>}
          </div>

          {workshop.attendance === "missed" && (
            <span className="flex items-center justify-center gap-1.5 rounded-full bg-[#2563eb] px-4 py-[10px] style-badge-text text-white transition-colors hover:bg-[#1e4fc7]">
              <PlayCircle className="h-4 w-4" />
              Watch Recording & Take Quiz
            </span>
          )}

          {!isPast && (
            <span className="flex items-center justify-center gap-1.5 rounded-full bg-[#2563eb] px-4 py-[10px] style-badge-text text-white shadow-[0_5px_14px_rgba(0,0,0,0.5)] transition-colors hover:bg-[#1e4fc7]">
              <Calendar className="h-4 w-4" />
              View Details
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
