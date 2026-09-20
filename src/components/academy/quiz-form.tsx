"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Flame } from "lucide-react";
import type { QuizQuestion } from "@/lib/academy-data";

type QuizFormProps = {
  questions: QuizQuestion[];
  dueAt: string;
  /** Called once the quiz is answered fully correctly. */
  onPass?: () => void;
};

function getDueStatus(dueAt: string) {
  const dueTime = new Date(dueAt).getTime();
  const now = Date.now();
  return {
    isPastDue: now > dueTime,
    daysLeft: Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24)),
  };
}

export function QuizForm({ questions, dueAt, onPass }: QuizFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<"pass" | "fail" | null>(null);

  const { isPastDue, daysLeft } = getDueStatus(dueAt);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  function handleSubmit() {
    const allCorrect = questions.every((q) => answers[q.id] === q.correctIndex);
    setResult(allCorrect ? "pass" : "fail");
    if (allCorrect) onPass?.();
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
  }

  if (isPastDue && result !== "pass") {
    return (
      <div className="flex flex-col items-center gap-[8px] rounded-[20px] border border-red-200 bg-[#fdf2f2] p-[28px] text-center">
        <XCircle className="h-8 w-8 text-red-600" />
        <p className="style-card-title text-red-700">Quiz Closed</p>
        <p className="style-body-text text-red-700/80">
          The window to make up attendance for this workshop has ended.
        </p>
      </div>
    );
  }

  if (result === "pass") {
    return (
      <div className="flex flex-col items-center gap-[8px] rounded-[20px] border border-emerald-200 bg-[#d2ecd9] p-[28px] text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-800" />
        <p className="style-card-title text-emerald-900">Nice work!</p>
        <p className="style-body-text text-emerald-900/80">
          You got every question right — attendance has been recorded for this workshop.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[20px] rounded-[20px] border border-[#2a2f3a] bg-[#181c25] p-[24px]">
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <h3 className="style-card-title text-white">Attendance Quiz</h3>
        {daysLeft <= 3 && daysLeft >= 0 && (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-[#fbe3cb] px-3 py-1 style-badge-text text-[#7a4416]">
            <Flame className="h-3.5 w-3.5" />
            Due in {daysLeft}d
          </span>
        )}
      </div>

      {result === "fail" && (
        <div className="flex items-center gap-2 rounded-[12px] border border-red-200 bg-[#fdf2f2] px-[16px] py-[12px]">
          <XCircle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="style-body-text text-red-700">
            Not quite — review your answers and try again.
          </p>
        </div>
      )}

      {questions.map((q, idx) => (
        <div key={q.id} className="flex flex-col gap-[10px]">
          <p className="style-body-text font-semibold text-white">
            {idx + 1}. {q.prompt}
          </p>
          <div className="flex flex-col gap-[8px]">
            {q.options.map((option, optionIdx) => (
              <label
                key={optionIdx}
                className={`flex cursor-pointer items-center gap-[10px] rounded-[10px] border px-[14px] py-[10px] style-body-text transition-colors ${
                  answers[q.id] === optionIdx
                    ? "border-[#d4af37] bg-[#d4af37]/15 text-[#f2c95c]"
                    : "border-[#2a2f3a] text-white/80 hover:border-[#d4af37]/40"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  className="accent-[#d4af37]"
                  checked={answers[q.id] === optionIdx}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optionIdx }))}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        {result === "fail" ? (
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-full bg-[#2563eb] px-[22px] py-[12px] style-button-text text-white transition-colors hover:bg-[#1e4fc7]"
          >
            Redo Quiz
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="rounded-full bg-[#d4af37] px-[22px] py-[12px] style-button-text text-ink transition-colors hover:bg-[#c19d2e] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
