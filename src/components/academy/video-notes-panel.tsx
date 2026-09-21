"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { resolveVideoEmbed } from "@/lib/video-embed";

type VideoNotesPanelProps = {
  title: string;
  videoUrl: string | null;
  /** Distinct key per video so notes don't bleed between lessons. */
  notesKey: string;
};

export function VideoNotesPanel({ title, videoUrl, notesKey }: VideoNotesPanelProps) {
  const storageKey = `academy-notes:${notesKey}`;
  const [notes, setNotes] = useState("");

  const embed = resolveVideoEmbed(videoUrl);

  // Personal scratch notes only — not admin content, so localStorage is fine
  // here rather than a database round-trip.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotes(localStorage.getItem(storageKey) ?? "");
    } catch {
      // Private browsing / blocked storage — notes just won't persist.
    }
  }, [storageKey]);

  function handleChange(value: string) {
    setNotes(value);
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      // Ignore — nothing to persist to if storage is unavailable.
    }
  }

  return (
    <div className="flex flex-col gap-[20px] lg:flex-row">
      <div className="flex flex-[1.6] flex-col gap-[12px]">
        <div className="overflow-hidden rounded-[20px] border-[5px] border-[#d4af37]">
          {embed?.kind === "file" && (
            <video
              src={embed.src}
              controls
              className="aspect-video w-full bg-black"
              preload="metadata"
            />
          )}

          {embed?.kind === "iframe" && (
            <iframe
              src={embed.src}
              title={title}
              className="aspect-video w-full bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {embed?.kind === "link" && (
            <a
              href={embed.src}
              target="_blank"
              rel="noreferrer"
              className="flex aspect-video w-full flex-col items-center justify-center gap-[8px] bg-[#181c25] px-[24px] text-center transition-colors hover:bg-[#1f2431]"
            >
              <ExternalLink className="h-6 w-6 text-[#d4af37]" />
              <span className="style-body-text text-white">Open the recording</span>
              <span className="style-caption text-white/60">
                This recording is hosted somewhere that can&apos;t be embedded here.
              </span>
            </a>
          )}

          {!embed && (
            <div className="flex aspect-video w-full items-center justify-center bg-[#181c25] px-[24px] text-center style-body-text text-white/60">
              The recording for this workshop hasn&apos;t been posted yet.
            </div>
          )}
        </div>
        <h3 className="style-card-title uppercase text-white">{title}</h3>
      </div>

      <div className="flex w-full flex-col gap-[8px] rounded-[20px] border-[5px] border-[#d4af37] bg-[#181c25] p-[16px] lg:w-[320px] lg:shrink-0">
        <div className="flex flex-col gap-[2px]">
          <span className="style-card-title text-white">My Notes</span>
          <span className="style-caption text-white/60">
            Write down key concepts while you watch.
          </span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Start typing..."
          className="min-h-[220px] flex-1 resize-none rounded-[12px] border border-[#2a2f3a] bg-[#e7e2d4] p-[12px] style-body-text text-ink outline-none focus:border-[#d4af37]"
        />
      </div>
    </div>
  );
}
