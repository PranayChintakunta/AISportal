"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users, PlayCircle } from "lucide-react";
import { isWorkshopPast, type Workshop } from "@/lib/academy-data";
import { formatEventDate } from "@/lib/utils";

export function UpNextCard({ workshop }: { workshop: Workshop }) {
  const isPast = isWorkshopPast(workshop);
  const eyebrow = isPast ? "Last Workshop" : "Up Next";
  const cta = workshop.attendance === "missed" ? "Watch Recording & Take Quiz" : "View Workshop";

  return (
    <Link href={`/academy/workshops/${workshop.id}`} className="block">
      <div className="group flex flex-col overflow-hidden rounded-[20px] border border-[#2a2f3a] bg-[#181c25] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#2563eb]/60 lg:flex-row">
        {/* Visual panel — the real branding mark, not a stock thumbnail */}
        <div className="relative flex shrink-0 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#2f5fe8_0%,#434655_55%,#181c25_100%)] p-[32px] lg:w-[280px]">
          <Image
            src="/images/academy/badge.png"
            alt=""
            width={500}
            height={500}
            className="h-[140px] w-[140px] object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-[12px] flex items-center gap-1.5 rounded-full bg-black/40 px-[12px] py-[6px] style-badge-text text-white backdrop-blur-sm">
            <PlayCircle className="h-3.5 w-3.5" />
            {isPast ? "Watch Recording" : "Preview"}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-[16px] p-[28px] lg:p-[32px]">
          <span className="style-badge-text w-fit rounded-full bg-[#2563eb]/15 px-[12px] py-[4px] uppercase tracking-widest text-[#9db8ff]">
            {eyebrow}
          </span>

          <div className="flex flex-col gap-[8px]">
            <h2 className="style-page-title leading-tight bg-[linear-gradient(90deg,#7aa2ff_0%,#2f5fe8_100%)] bg-clip-text text-transparent">
              {workshop.title}
            </h2>
            <p className="style-body-text max-w-2xl text-white/75">{workshop.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-[24px] gap-y-[8px] style-caption text-white/60">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatEventDate(workshop.startTime, true)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {workshop.location}
            </span>
            {!isPast && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {workshop.seatsAvailable} / {workshop.seatsTotal} seats available
              </span>
            )}
          </div>

          <span className="mt-auto flex w-fit items-center gap-2 rounded-full bg-[#2563eb] px-[24px] py-[12px] style-badge-text text-white shadow-[0_5px_14px_rgba(0,0,0,0.5)] transition-colors group-hover:bg-[#1e4fc7]">
            <PlayCircle className="h-4 w-4" />
            {cta}
          </span>
        </div>
      </div>
    </Link>
  );
}
