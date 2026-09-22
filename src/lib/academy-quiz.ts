import { z } from "zod";

/**
 * Quiz question shape and grading.
 *
 * Unlike application questions, a quiz answer can be wrong, and passing one
 * grants attendance credit. That makes the schema worth enforcing properly and
 * the grading worth doing on the server — a client-graded quiz is a quiz every
 * member passes.
 */

export const quizQuestionSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().trim().min(1, "Every question needs a prompt."),
    options: z
      .array(z.string().trim().min(1, "Options cannot be blank."))
      .min(2, "Each question needs at least two options."),
    correctIndex: z.number().int().min(0),
  })
  .refine((q) => q.correctIndex < q.options.length, {
    message: "Mark one of the listed options as the correct answer.",
    path: ["correctIndex"],
  });

export const quizQuestionsSchema = z
  .array(quizQuestionSchema)
  .min(1, "A quiz needs at least one question.");

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

/** A question as the member sees it — without the answer key. */
export type MemberQuizQuestion = Omit<QuizQuestion, "correctIndex">;

/**
 * Reads questions back out of the `Json` column. Returns an empty list rather
 * than throwing, so a malformed row degrades to "no quiz" instead of breaking
 * the whole workshop page.
 */
export function parseQuizQuestions(value: unknown): QuizQuestion[] {
  const result = quizQuestionsSchema.safeParse(value);
  return result.success ? result.data : [];
}

/** Strips the answer key before questions are sent to the browser. */
export function toMemberQuestions(questions: QuizQuestion[]): MemberQuizQuestion[] {
  return questions.map(({ id, prompt, options }) => ({ id, prompt, options }));
}

export const quizAnswersSchema = z.record(z.string(), z.number().int().min(0));

export type QuizAnswers = z.infer<typeof quizAnswersSchema>;

export type QuizQuestionResult = {
  questionId: string;
  /** What the member picked, or null if they skipped it. */
  selectedIndex: number | null;
  correct: boolean;
};

export type QuizResult = {
  correctCount: number;
  total: number;
  /** Percent, rounded. */
  score: number;
  passed: boolean;
  results: QuizQuestionResult[];
};

/**
 * Grades a submission. Unanswered and out-of-range answers simply count as
 * wrong rather than erroring, so a partial submission still returns a score.
 */
export function gradeQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswers,
  passingScore: number
): QuizResult {
  const total = questions.length;

  if (total === 0) {
    return { correctCount: 0, total: 0, score: 0, passed: false, results: [] };
  }

  const results: QuizQuestionResult[] = questions.map((q) => {
    const selected = answers[q.id];
    return {
      questionId: q.id,
      selectedIndex: typeof selected === "number" ? selected : null,
      correct: selected === q.correctIndex,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const score = Math.round((correctCount / total) * 100);

  return { correctCount, total, score, passed: score >= passingScore, results };
}

/**
 * The answer key, for revealing after a pass. Withheld on a failed attempt so
 * a retake still requires knowing the material.
 */
export function buildAnswerKey(questions: QuizQuestion[]): Record<string, number> {
  return Object.fromEntries(questions.map((q) => [q.id, q.correctIndex]));
}
