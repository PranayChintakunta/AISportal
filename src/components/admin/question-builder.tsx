"use client";

import { Button } from "@/components/ui/button";

/**
 * Shared question editor behind both the application posting form and the
 * Academy quiz builder. Applications need several input types and no notion of
 * a right answer; quizzes are always multiple choice and must mark one option
 * correct. Everything else — ordering, duplication, option editing — is the
 * same, so it lives here once.
 */

export type BuilderQuestionType =
  | "TEXT"
  | "LONG_TEXT"
  | "DROPDOWN"
  | "CHECKBOX"
  | "FILE"
  | "MULTIPLE_CHOICE";

export type BuilderQuestion = {
  id: string;
  label: string;
  description?: string;
  type: BuilderQuestionType;
  required: boolean;
  options: string[];
  placeholder?: string;
  /** Index into `options`. Quiz mode only. */
  correctIndex?: number;
};

export const APPLICATION_TYPE_OPTIONS: { value: BuilderQuestionType; label: string }[] = [
  { value: "TEXT", label: "Short Text" },
  { value: "LONG_TEXT", label: "Paragraph Text" },
  { value: "DROPDOWN", label: "Dropdown Menu" },
  { value: "CHECKBOX", label: "Checkboxes" },
  { value: "FILE", label: "File Upload" },
];

export function createQuestionId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyQuestion(
  type: BuilderQuestionType = "TEXT",
  optionCount = 1
): BuilderQuestion {
  return {
    id: createQuestionId(),
    label: "",
    description: "",
    type,
    required: true,
    options: Array.from({ length: optionCount }, () => ""),
    ...(type === "MULTIPLE_CHOICE" ? { correctIndex: 0 } : {}),
  };
}

/** Drops blank options from choice questions; other types carry none. */
export function cleanQuestions(questions: BuilderQuestion[]): BuilderQuestion[] {
  return questions.map((q) => {
    const description = q.description?.trim() || undefined;

    if (!hasOptions(q.type)) {
      return { ...q, description, options: [] };
    }

    // Dropping blanks shifts every later option up, so `correctIndex` has to be
    // remapped against the surviving options — otherwise saving a quiz with a
    // stray empty option silently moves the answer key to the wrong choice.
    const kept = q.options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => option.trim() !== "");

    const correctIndex =
      typeof q.correctIndex === "number"
        ? Math.max(
            0,
            kept.findIndex(({ index }) => index === q.correctIndex)
          )
        : q.correctIndex;

    return { ...q, description, options: kept.map(({ option }) => option), correctIndex };
  });
}

function hasOptions(type: BuilderQuestionType): boolean {
  return type === "DROPDOWN" || type === "CHECKBOX" || type === "MULTIPLE_CHOICE";
}

type QuestionBuilderProps = {
  questions: BuilderQuestion[];
  onChange: (questions: BuilderQuestion[]) => void;
  /** Input types the picker offers. Omitted hides the picker (fixed type). */
  typeOptions?: { value: BuilderQuestionType; label: string }[];
  /** Adds a "correct answer" radio to each option. */
  markCorrectAnswer?: boolean;
  showRequiredToggle?: boolean;
  showDescription?: boolean;
  labelText?: string;
  labelPlaceholder?: string;
  /** Type used for questions created by "+ Add Question". */
  newQuestionType?: BuilderQuestionType;
  newQuestionOptionCount?: number;
};

export function QuestionBuilder({
  questions,
  onChange,
  typeOptions,
  markCorrectAnswer = false,
  showRequiredToggle = true,
  showDescription = true,
  labelText = "Question Label",
  labelPlaceholder = "e.g. What is your academic standing?",
  newQuestionType = "TEXT",
  newQuestionOptionCount = 1,
}: QuestionBuilderProps) {
  function updateQuestion(qIndex: number, fields: Partial<BuilderQuestion>) {
    onChange(questions.map((q, idx) => (idx === qIndex ? { ...q, ...fields } : q)));
  }

  function addQuestion() {
    onChange([...questions, createEmptyQuestion(newQuestionType, newQuestionOptionCount)]);
  }

  function removeQuestion(qIndex: number) {
    onChange(questions.filter((_, idx) => idx !== qIndex));
  }

  function duplicateQuestion(qIndex: number) {
    const original = questions[qIndex];
    if (!original) return;

    const copy: BuilderQuestion = {
      ...original,
      id: createQuestionId(),
      label: `${original.label} (Copy)`,
      options: [...original.options],
    };

    const updated = [...questions];
    updated.splice(qIndex + 1, 0, copy);
    onChange(updated);
  }

  function moveQuestion(qIndex: number, direction: "UP" | "DOWN") {
    const targetIndex = direction === "UP" ? qIndex - 1 : qIndex + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const updated = [...questions];
    [updated[qIndex], updated[targetIndex]] = [updated[targetIndex], updated[qIndex]];
    onChange(updated);
  }

  function addOption(qIndex: number) {
    updateQuestion(qIndex, { options: [...questions[qIndex].options, ""] });
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    const options = [...questions[qIndex].options];
    options[oIndex] = value;
    updateQuestion(qIndex, { options });
  }

  function removeOption(qIndex: number, oIndex: number) {
    const question = questions[qIndex];
    const options = question.options.filter((_, i) => i !== oIndex);

    // Removing the option that was marked correct would otherwise leave the
    // index pointing at the wrong answer, or past the end of the list.
    let correctIndex = question.correctIndex;
    if (markCorrectAnswer && typeof correctIndex === "number") {
      if (correctIndex === oIndex) correctIndex = 0;
      else if (correctIndex > oIndex) correctIndex -= 1;
    }

    updateQuestion(qIndex, { options, correctIndex });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="flex flex-col gap-4 rounded-xl border border-border-soft bg-row-soft p-5 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft/60 pb-3">
              <div className="flex items-center gap-1">
                <span className="style-caption font-semibold text-ink-muted mr-2">
                  #{qIndex + 1}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={qIndex === 0}
                  onClick={() => moveQuestion(qIndex, "UP")}
                  className="h-8 w-8 p-0 text-ink-muted disabled:opacity-30"
                  title="Move Up"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={qIndex === questions.length - 1}
                  onClick={() => moveQuestion(qIndex, "DOWN")}
                  className="h-8 w-8 p-0 text-ink-muted disabled:opacity-30"
                  title="Move Down"
                >
                  ↓
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {showRequiredToggle && (
                  <>
                    <label
                      htmlFor={`req_${q.id}`}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <input
                        id={`req_${q.id}`}
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(qIndex, { required: e.target.checked })}
                        className="h-4 w-4 rounded accent-brand cursor-pointer"
                      />
                      <span className="style-caption font-medium text-ink">Required</span>
                    </label>
                    <div className="h-4 w-[1px] bg-border-soft" />
                  </>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => duplicateQuestion(qIndex)}
                  className="h-8 px-2.5 style-caption font-semibold text-ink hover:bg-white"
                  title="Duplicate Question"
                >
                  Duplicate
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={questions.length === 1}
                  onClick={() => removeQuestion(qIndex)}
                  className="h-8 px-2.5 style-caption font-semibold text-danger-ink hover:bg-danger-border/20 disabled:opacity-40"
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div
                className={
                  typeOptions ? "md:col-span-2 flex flex-col gap-3" : "md:col-span-3 flex flex-col gap-3"
                }
              >
                <div className="flex flex-col gap-[6px]">
                  <label className="style-caption font-medium text-ink-muted">{labelText}</label>
                  <input
                    required
                    value={q.label}
                    onChange={(e) => updateQuestion(qIndex, { label: e.target.value })}
                    placeholder={labelPlaceholder}
                    className="h-[42px] w-full rounded-lg border border-border-soft bg-white px-3.5 style-body-text text-ink outline-none transition-colors focus:border-brand"
                  />
                </div>

                {showDescription && (
                  <div className="flex flex-col gap-[6px]">
                    <label className="style-caption font-medium text-ink-muted">
                      Subtext / Helper Description (Optional)
                    </label>
                    <input
                      value={q.description ?? ""}
                      onChange={(e) => updateQuestion(qIndex, { description: e.target.value })}
                      placeholder="Provide context or guidelines for answering this question..."
                      className="h-[38px] w-full rounded-lg border border-border-soft bg-white px-3 style-caption text-ink outline-none transition-colors focus:border-brand"
                    />
                  </div>
                )}
              </div>

              {typeOptions && (
                <div className="flex flex-col gap-[6px]">
                  <label className="style-caption font-medium text-ink-muted">Input Type</label>
                  <select
                    value={q.type}
                    onChange={(e) =>
                      updateQuestion(qIndex, { type: e.target.value as BuilderQuestionType })
                    }
                    className="h-[42px] w-full rounded-lg border border-border-soft bg-white px-3.5 style-body-text text-ink outline-none transition-colors focus:border-brand"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {hasOptions(q.type) && (
              <div className="ml-1 border-l-2 border-border-soft pl-4 pt-2 flex flex-col gap-3">
                <span className="style-caption font-medium text-ink-muted">
                  {markCorrectAnswer ? "Answer Options (select the correct one)" : "Configured Options"}
                </span>
                <div className="flex flex-col gap-2">
                  {(q.options ?? []).map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      {markCorrectAnswer && (
                        <input
                          type="radio"
                          name={`correct_${q.id}`}
                          checked={q.correctIndex === oIndex}
                          onChange={() => updateQuestion(qIndex, { correctIndex: oIndex })}
                          aria-label={`Mark option ${oIndex + 1} correct`}
                          title="Correct answer"
                          className="h-4 w-4 shrink-0 accent-brand cursor-pointer"
                        />
                      )}
                      <input
                        required
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="h-[38px] flex-1 rounded-lg border border-border-soft bg-white px-3 style-body-text text-ink outline-none transition-colors focus:border-brand"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={q.options.length <= (markCorrectAnswer ? 2 : 1)}
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="h-[38px] w-[38px] p-0 text-ink-muted hover:text-danger-ink disabled:opacity-30"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addOption(qIndex)}
                  className="w-fit h-[34px] rounded-lg border-border-soft style-caption text-ink"
                >
                  + Add Option
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Button type="button" size="sm" variant="outline" onClick={addQuestion}>
          + Add Question
        </Button>
      </div>
    </div>
  );
}
