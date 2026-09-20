"use client";

import { useEffect, useState } from "react";

type VideoNotesPanelProps = {
  title: string;
  videoUrl: string;
  /** Distinct key per video so notes don't bleed between lessons. */
  notesKey: string;
  /** Fires once, the first time the video reaches its end. */
  onWatched?: () => void;
};

export function VideoNotesPanel({ title, videoUrl, notesKey, onWatched }: VideoNotesPanelProps) {
  const storageKey = `academy-notes:${notesKey}`;
  const [notes, setNotes] = useState("");

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
          <video
            src={videoUrl}
            controls
            className="aspect-video w-full bg-black"
            preload="metadata"
            onEnded={onWatched}
          />
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
