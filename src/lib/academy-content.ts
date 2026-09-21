import "server-only";

import { prisma } from "@/lib/prisma";
import {
  buildAnswerKey,
  gradeQuiz,
  parseQuizQuestions,
  quizAnswersSchema,
  toMemberQuestions,
  type MemberQuizQuestion,
  type QuizQuestionResult,
} from "@/lib/academy-quiz";

/**
 * Read models for the member-facing Academy pages.
 *
 * Everything here is plain serializable data so it can cross into client
 * components, and quiz answer keys are stripped before they leave.
 */

export type AcademyWorkshopSummary = {
  id: string;
  title: string;
  description: string;
  location: string;
  /** ISO string. */
  startTime: string;
  /** ISO string. */
  endTime: string;
  seatsTotal: number | null;
  seatsAvailable: number | null;
  hasRecording: boolean;
  /** Whether the viewer has attendance credit. False when signed out. */
  hasAttended: boolean;
};

export type AcademyQuizAttempt = {
  /** Percent. */
  score: number;
  correctCount: number;
  total: number;
  passed: boolean;
  /** ISO string. */
  submittedAt: string;
  results: QuizQuestionResult[];
  /** Populated only on a passing attempt. */
  answerKey: Record<string, number> | null;
};

export type AcademyWorkshopDetail = AcademyWorkshopSummary & {
  recordingUrl: string | null;
  summary: string | null;
  /** ISO string. */
  quizDueAt: string | null;
  questions: MemberQuizQuestion[];
  /** The viewer's most recent submission, if they've taken the quiz. */
  latestAttempt: AcademyQuizAttempt | null;
};

export type AcademyResource = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  href: string;
};

const WORKSHOP_WHERE = { isPublished: true, programs: { has: "AI_ACADEMY" as const } };

function seatsAvailable(capacity: number | null, taken: number): number | null {
  if (capacity === null) return null;
  return Math.max(0, capacity - taken);
}

export async function listAcademyWorkshops(
  viewerId: string | null
): Promise<AcademyWorkshopSummary[]> {
  const workshops = await prisma.event.findMany({
    where: WORKSHOP_WHERE,
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      startTime: true,
      endTime: true,
      capacity: true,
      workshopContent: { select: { recordingUrl: true } },
      _count: { select: { rsvps: { where: { status: { not: "CANCELED" } } } } },
    },
  });

  // One query for every workshop the viewer has credit for, rather than a
  // lookup per card.
  const attendedIds = viewerId
    ? new Set(
        (
          await prisma.attendance.findMany({
            where: { userId: viewerId, eventId: { in: workshops.map((w) => w.id) } },
            select: { eventId: true },
          })
        ).map((a) => a.eventId)
      )
    : new Set<string>();

  return workshops.map((w) => ({
    id: w.id,
    title: w.title,
    description: w.description,
    location: w.location,
    startTime: w.startTime.toISOString(),
    endTime: w.endTime.toISOString(),
    seatsTotal: w.capacity,
    seatsAvailable: seatsAvailable(w.capacity, w._count.rsvps),
    hasRecording: Boolean(w.workshopContent?.recordingUrl),
    hasAttended: attendedIds.has(w.id),
  }));
}

export async function getAcademyWorkshop(
  id: string,
  viewerId: string | null
): Promise<AcademyWorkshopDetail | null> {
  const workshop = await prisma.event.findFirst({
    where: { id, ...WORKSHOP_WHERE },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      startTime: true,
      endTime: true,
      capacity: true,
      workshopContent: {
        select: {
          recordingUrl: true,
          summary: true,
          quizDueAt: true,
          quiz: { select: { id: true, questionsJson: true, isPublished: true } },
        },
      },
      _count: { select: { rsvps: { where: { status: { not: "CANCELED" } } } } },
    },
  });

  if (!workshop) return null;

  const content = workshop.workshopContent;
  const quiz = content?.quiz?.isPublished ? content.quiz : null;
  const questions = quiz ? parseQuizQuestions(quiz.questionsJson) : [];

  // Viewer-specific, so skip these entirely for signed-out visitors rather
  // than querying with a null user.
  const [attendance, attempt] = viewerId
    ? await Promise.all([
        prisma.attendance.findUnique({
          where: { userId_eventId: { userId: viewerId, eventId: workshop.id } },
          select: { id: true },
        }),
        quiz
          ? prisma.quizAttempt.findFirst({
              where: { quizId: quiz.id, userId: viewerId },
              orderBy: { submittedAt: "desc" },
              select: { answersJson: true, submittedAt: true, passed: true },
            })
          : null,
      ])
    : [null, null];

  // Re-grade the stored answers rather than persisting per-question results:
  // the attempt row keeps what the member picked, and the answer key lives in
  // exactly one place.
  const latestAttempt: AcademyQuizAttempt | null = attempt
    ? (() => {
        const answers = quizAnswersSchema.safeParse(attempt.answersJson);
        const graded = gradeQuiz(questions, answers.success ? answers.data : {}, 100);

        return {
          score: graded.score,
          correctCount: graded.correctCount,
          total: graded.total,
          passed: attempt.passed,
          submittedAt: attempt.submittedAt.toISOString(),
          results: graded.results,
          answerKey: attempt.passed ? buildAnswerKey(questions) : null,
        };
      })()
    : null;

  return {
    id: workshop.id,
    title: workshop.title,
    description: workshop.description,
    location: workshop.location,
    startTime: workshop.startTime.toISOString(),
    endTime: workshop.endTime.toISOString(),
    seatsTotal: workshop.capacity,
    seatsAvailable: seatsAvailable(workshop.capacity, workshop._count.rsvps),
    hasRecording: Boolean(content?.recordingUrl),
    hasAttended: Boolean(attendance),
    recordingUrl: content?.recordingUrl ?? null,
    summary: content?.summary ?? null,
    quizDueAt: content?.quizDueAt?.toISOString() ?? null,
    questions: toMemberQuestions(questions),
    latestAttempt,
  };
}

export async function listAcademyResources(): Promise<AcademyResource[]> {
  const resources = await prisma.academyResource.findMany({
    where: { isPublished: true, href: { not: null } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      href: true,
    },
  });

  return resources.map((r) => ({ ...r, href: r.href as string }));
}

/**
 * Picks what to headline on the Academy hub, in order of what a member most
 * needs right now: a session in progress, then the newest replay they can
 * watch, then whatever is scheduled next. Only the middle case has a video,
 * so callers must handle a featured workshop with no recording.
 */
export async function getFeaturedWorkshop(
  viewerId: string | null
): Promise<AcademyWorkshopDetail | null> {
  const now = new Date();

  const happeningNow = await prisma.event.findFirst({
    where: { ...WORKSHOP_WHERE, startTime: { lte: now }, endTime: { gte: now } },
    orderBy: { startTime: "asc" },
    select: { id: true },
  });

  if (happeningNow) return getAcademyWorkshop(happeningNow.id, viewerId);

  const latestReplay = await prisma.event.findFirst({
    where: {
      ...WORKSHOP_WHERE,
      endTime: { lt: now },
      workshopContent: { recordingUrl: { not: null } },
    },
    orderBy: { startTime: "desc" },
    select: { id: true },
  });

  if (latestReplay) return getAcademyWorkshop(latestReplay.id, viewerId);

  const nextUp = await prisma.event.findFirst({
    where: { ...WORKSHOP_WHERE, startTime: { gt: now } },
    orderBy: { startTime: "asc" },
    select: { id: true },
  });

  return nextUp ? getAcademyWorkshop(nextUp.id, viewerId) : null;
}

export function isWorkshopPast(workshop: { endTime: string }): boolean {
  return new Date(workshop.endTime).getTime() < Date.now();
}

export function hasWorkshopStarted(workshop: { startTime: string }): boolean {
  return new Date(workshop.startTime).getTime() <= Date.now();
}

export function isWorkshopInProgress(workshop: {
  startTime: string;
  endTime: string;
}): boolean {
  const now = Date.now();
  return (
    new Date(workshop.startTime).getTime() <= now &&
    now <= new Date(workshop.endTime).getTime()
  );
}
