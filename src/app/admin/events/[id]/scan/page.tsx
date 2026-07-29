import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QRScannerClient } from "@/components/admin/qr-scanner";

export const metadata: Metadata = {
  title: "AIS Admin — Scan Check-in",
};

export default async function EventScanPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: { title: true, id: true }
  });

  if (!event) return notFound();

  return (
    <div className="flex h-full flex-1 flex-col gap-5 p-[46px]">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/events"
            className="font-mono text-xs text-brand tracking-wide"
          >
            ← Back to Events
          </Link>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">
            Check-in: {event.title}
          </h2>
        </div>
      </div>

      <div className="flex mt-8 flex-col items-center justify-center">
        {/* Pass the event ID down to the client component */}
        <QRScannerClient eventId={event.id} />
      </div>
    </div>
  );
}