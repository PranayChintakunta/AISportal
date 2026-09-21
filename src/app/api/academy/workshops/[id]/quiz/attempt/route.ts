import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createErrorResponse } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildAnswerKey,
  gradeQuiz,
  parseQuizQuestions,
  quizAnswersSchema,
} from "@/lib/academy-quiz";

const bodySchema = z.object({ answers: quizAnswersSchema });

/**
 * Grades a quiz submission.
 *
 * Grading happens here rather than in the browser because passing grants
 * attendance credit — the answer key never leaves the server, and the score
 * the member sees is the score that was recorded.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return createErrorResponse("Unauthorized", "UNAUTHENTICATED", 401);
  }

  const { id } = await params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return createErrorResponse("Malformed JSON body.", "BAD_REQUEST", 400);
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return createErrorResponse("Invalid answers.", "BAD_REQUEST", 400);
  }

  const workshop = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      isPublished: true,
      programs: true,
      workshopContent: {
        select: {
          quizDueAt: true,
          quiz: {
            select: { id: true, questionsJson: true, passingScore: true, isPublished: true },
          },
        },
      },
    },
  });

  const quiz = workshop?.workshopContent?.quiz;

  if (!workshop || !workshop.isPublished || !quiz?.isPublished) {
    return createErrorResponse("Quiz not found.", "NOT_FOUND", 404);
  }

  if (!workshop.programs.includes("AI_ACADEMY")) {
    return createErrorResponse("This event is not an Academy workshop.", "BAD_REQUEST", 400);
  }

  const dueAt = workshop.workshopContent?.quizDueAt;
  if (dueAt && new Date() > dueAt) {
    return createErrorResponse("This quiz has closed.", "QUIZ_CLOSED", 409);
  }

  const questions = parseQuizQuestions(quiz.questionsJson);
  if (questions.length === 0) {
    return createErrorResponse("This quiz has no questions.", "NOT_FOUND", 404);
  }

  const result = gradeQuiz(questions, parsed.data.answers, quiz.passingScore);

  await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: user.id,
      answersJson: parsed.data.answers,
      score: result.score,
      passed: result.passed,
    },
  });

  if (result.passed) {
    // Link the credit to an existing RSVP when there is one so the event's
    // check-in views stay consistent, but don't require it — the whole point of
    // the make-up quiz is that the member wasn't there.
    const rsvp = await prisma.rSVP.findUnique({
      where: { userId_eventId: { userId: user.id, eventId: workshop.id } },
      select: { id: true },
    });

    await prisma.attendance.upsert({
      where: { userId_eventId: { userId: user.id, eventId: workshop.id } },
      create: {
        userId: user.id,
        eventId: workshop.id,
        rsvpId: rsvp?.id ?? null,
        method: "QUIZ",
      },
      // An existing record means they were already credited, in person or
      // otherwise; don't overwrite how they earned it.
      update: {},
    });
  }

  revalidatePath(`/academy/workshops/${id}`);

  return NextResponse.json({
    success: true,
    score: result.score,
    correctCount: result.correctCount,
    total: result.total,
    passed: result.passed,
    results: result.results,
    // Revealed only once they've passed — handing back the key after a failed
    // attempt would make the retake meaningless.
    answerKey: result.passed ? buildAnswerKey(questions) : null,
  });
}
