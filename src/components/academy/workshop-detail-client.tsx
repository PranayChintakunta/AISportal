"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { VideoNotesPanel } from "@/components/academy/video-notes-panel";
import { QuizForm } from "@/components/academy/quiz-form";
import type { Workshop } from "@/lib/academy-data";

export function WorkshopDetailClient({ workshop }: { workshop: Workshop }) {
  const [hasWatched, setHasWatched] = useState(workshop.attendance === "attended");

  if (workshop.attendance === "attended") {
    return (
      <div className="flex flex-col gap-[20px]">
        <div className="flex items-center gap-2 rounded-[14px] border border-emerald-200 bg-[#d2ecd9] px-[16px] py-[12px] style-body-text text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          You already have attendance for this workshop — enjoy the replay.
        </div>
        <VideoNotesPanel
          title={workshop.title}
          videoUrl={workshop.videoUrl}
          notesKey={workshop.id}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <VideoNotesPanel
        title={workshop.title}
        videoUrl={workshop.videoUrl}
        notesKey={workshop.id}
        onWatched={() => setHasWatched(true)}
      />

      {workshop.quiz.length === 0 ? (
        <p className="style-body-text text-white/70">
          No attendance quiz for this workshop.
        </p>
      ) : hasWatched ? (
        <QuizForm questions={workshop.quiz} dueAt={workshop.quizDueAt} />
      ) : (
        <div className="rounded-[20px] border border-dashed border-[#2a2f3a] bg-[#181c25] p-[24px] text-center style-body-text text-white/70">
          Finish watching the recording above to unlock the attendance quiz.
        </div>
      )}
    </div>
  );
}
