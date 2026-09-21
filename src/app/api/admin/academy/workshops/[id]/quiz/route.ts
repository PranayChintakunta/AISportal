import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createErrorResponse } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAcademy } from "@/lib/roles";
import { quizQuestionsSchema } from "@/lib/academy-quiz";

const bodySchema = z.object({
  questions: quizQuestionsSchema,
  passingScore: z.number().int().min(1).max(100),
  isPublished: z.boolean(),
});

/** Creates or replaces the quiz attached to a workshop. */
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

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    // Surface the first real problem rather than the whole Zod tree — the
    // editor shows this string directly.
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
