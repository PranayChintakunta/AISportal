"use client";

import { useState } from "react";
import { FormField, FormTextarea } from "@/components/ui/form-field";

type RecordingCardProps = {
  defaultRecordingUrl?: string | null;
  defaultSummary?: string | null;
  defaultQuizDueAt?: string;
};

/**
 * Recording panel for a workshop: a link to the replay plus the notes and quiz
 * deadline that go with it. Links rather than uploads — recordings run to
 * gigabytes, which is a different upload path than the 2 MB cover image.
 */
export function RecordingCard({
  defaultRecordingUrl,
  defaultSummary,
  defaultQuizDueAt,
}: RecordingCardProps) {
  const [url, setUrl] = useState(defaultRecordingUrl ?? "");

  const trimmed = url.trim();
  let hostname: string | null = null;
  let isInvalid = false;

  if (trimmed) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        hostname = parsed.hostname.replace(/^www\./, "");
      } else {
        isInvalid = true;
      }
    } catch {
      isInvalid = true;
    }
  }

  return (
    <div className="flex w-full flex-col gap-[14px] rounded-[16px] border border-border-soft bg-white px-[25px] pb-[25px] pt-[24px]">
      <h3 className="w-full style-section-header leading-[21.25px] text-ink [font-variation-settings:'wdth'_100]">
        Recording
      </h3>

      <FormField
        label="Video link"
        name="recordingUrl"
        type="url"
        placeholder="https://youtube.com/watch?v=…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        error={isInvalid ? "Not a valid URL" : undefined}
        helperText="YouTube, Vimeo or Drive. Members watch this if they missed the workshop."
      />

      {hostname && !isInvalid && (
        <span className="style-caption text-ink-faint">✓ Links to {hostname}</span>
      )}

      <FormTextarea
        label="Notes"
        name="summary"
        placeholder="What this workshop covered…"
        defaultValue={defaultSummary ?? ""}
        helperText="Shown beneath the video."
      />

      <FormField
        label="Quiz due"
        name="quizDueAt"
        type="datetime-local"
        defaultValue={defaultQuizDueAt ?? ""}
        helperText="Optional. Deadline for the attendance quiz."
      />
    </div>
  );
}
