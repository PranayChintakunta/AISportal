import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Users } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TopographyBackground } from "@/components/academy/topography-background";
import { AcademyGradientBackground } from "@/components/academy/gradient-background";
import { WorkshopDetailClient } from "@/components/academy/workshop-detail-client";
import { getWorkshop, isWorkshopPast } from "@/lib/academy-data";
import { formatEventDate } from "@/lib/utils";

interface WorkshopDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkshopDetailPage({ params }: WorkshopDetailPageProps) {
  const { id } = await params;
  const workshop = getWorkshop(id);
  if (!workshop) notFound();

  const isUpcoming = !isWorkshopPast(workshop);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AcademyGradientBackground />
      <Navbar active="Academy" />

      <main className="mx-auto flex w-full max-w-[1100px] h-screen flex-col gap-[24px] px-[24px] pb-[64px] pt-28 lg:px-[46px]">
        <Link
          href="/academy"
          className="style-caption w-fit leading-[16.8px] tracking-[0.2px] text-[#d4af37]"
        >
          ← Back to AI Academy
        </Link>

        <section className="relative overflow-hidden rounded-[16px] border-t-[10px] border-b-[10px] border-[#2f5fe8] bg-[#181c25] p-[32px]">
          <TopographyBackground />
          <h1 className="style-page-title leading-tight text-white">{workshop.title}</h1>
          <p className="style-body-text mt-[8px] max-w-2xl text-white/75">
            {workshop.description}
          </p>
          <div className="mt-[16px] flex flex-wrap items-center gap-x-[24px] gap-y-[8px] style-caption text-white/60">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatEventDate(workshop.startTime, true)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {workshop.location}
            </span>
            {isUpcoming && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {workshop.seatsAvailable} / {workshop.seatsTotal} seats available
              </span>
            )}
          </div>
        </section>

        {isUpcoming ? (
          <div className="rounded-[20px] border border-dashed border-[#2a2f3a] bg-[#181c25] p-[24px] text-center style-body-text text-white/70">
            This workshop hasn&apos;t happened yet — RSVP on the{" "}
            <Link href="/events" className="text-[#7aa2ff] underline">
              events page
            </Link>{" "}
            and the recording + quiz will appear here afterward.
          </div>
        ) : (
          <WorkshopDetailClient workshop={workshop} />
        )}
      </main>

      <Footer />
    </div>
  );
}
