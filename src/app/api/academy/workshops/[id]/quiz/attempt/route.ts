import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createErrorResponse } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAcademy } from "@/lib/roles";
import { quizQuestionsSchema, parseQuizQuestions, type QuizQuestion } from "@/lib/academy-quiz";
import { AttendanceMethod } from "@prisma/client";

// ==========================================
// 1. SCHEMAS
// ==========================================

const editQuizSchema = z.object({
  questions: quizQuestionsSchema,
  passingScore: z.number().int().min(1).max(100),
  isPublished: z.boolean(),
});

const submitAttemptSchema = z.object({
  answers: z.record(z.string(), z.number()), // Question ID -> Selected option index
});

// ==========================================
// 2. PUT: Save/Update Quiz Definition (Admin)
// ==========================================

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedUser();

  if (!actor) {
    return createErrorResponse("Unauthorized", "UNAUTHENTICATED", 401);
  }

  if (!canManageAcademy(actor.role, actor.team)) {
    return createErrorResponse("Forbidden", "FORBIDDEN", 403);
  }

  const { id } = await params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return createErrorResponse("Malformed JSON body.", "BAD_REQUEST", 400);
  }

  const parsed = editQuizSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return createErrorResponse(
      issue?.message ?? "Invalid quiz.",
      "BAD_REQUEST",
      400,
      { issues: parsed.error.issues }
    );
  }

  const { questions, passingScore, isPublished } = parsed.data;

  const workshop = await prisma.workshop.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!workshop) {
    return createErrorResponse("Workshop not found.", "NOT_FOUND", 404);
  }

  const quiz = await prisma.quiz.upsert({
    where: { workshopId: id },
    create: {
      workshopId: id,
      questionsJson: questions,
      passingScore,
      isPublished,
    },
    update: {
      questionsJson: questions,
      passingScore,
      isPublished,
    },
  });

  revalidatePath(`/admin/academy/workshops/${id}/quiz`);
  revalidatePath("/admin/academy/workshops");
  revalidatePath(`/academy/workshops/${id}`);

  return NextResponse.json({ success: true, quizId: quiz.id });
}

// ==========================================
// 3. POST: Submit Quiz Attempt (Member)
// ==========================================

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedUser();

  const userId = actor?.id || actor?.profile?.userId;
  if (!userId) {
    return createErrorResponse("Unauthorized", "UNAUTHENTICATED", 401);
  }

  const { id: workshopId } = await params;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return createErrorResponse("Malformed JSON body.", "BAD_REQUEST", 400);
  }

  const parsed = submitAttemptSchema.safeParse(raw);
  if (!parsed.success) {
    return createErrorResponse("Invalid submission.", "BAD_REQUEST", 400);
  }

  const { answers } = parsed.data;

  // Fetch workshop & quiz
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    select: {
      id: true,
      quiz: true,
    },
  });

  if (!workshop || !workshop.quiz) {
    return createErrorResponse("Quiz not found.", "NOT_FOUND", 404);
  }

  if (!workshop.quiz.isPublished) {
    return createErrorResponse("Quiz is not currently open.", "FORBIDDEN", 403);
  }

  // Calculate score
  const questions: QuizQuestion[] = parseQuizQuestions(workshop.quiz.questionsJson);
  if (questions.length === 0) {
    return createErrorResponse("Quiz has no questions.", "BAD_REQUEST", 400);
  }

  let correctCount = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctIndex) {
      correctCount++;
    }
  }

  const scorePercentage = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercentage >= workshop.quiz.passingScore;

  // Record attempt & issue attendance credit if passed
  await prisma.$transaction(async (tx) => {
    await tx.quizAttempt.create({
      data: {
        userId,
        quizId: workshop.quiz!.id,
        score: scorePercentage,
        passed,
        answersJson: answers,
      },
    });

    if (passed) {
      await tx.attendance.upsert({
        where: {
          userId_workshopId: {
            userId,
            workshopId,
          },
        },
        update: {
          checkedInAt: new Date(),
          method: AttendanceMethod.QUIZ,
        },
        create: {
          userId,
          workshopId,
          checkedInAt: new Date(),
          method: AttendanceMethod.QUIZ,
        },
      });
    }
  });

  revalidatePath(`/academy/workshops/${workshopId}`);

  return NextResponse.json({
    success: true,
    passed,
    score: scorePercentage,
    passingScore: workshop.quiz.passingScore,
  });
}