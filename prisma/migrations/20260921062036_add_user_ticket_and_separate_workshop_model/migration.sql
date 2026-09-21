/*
  Warnings:

  - You are about to drop the column `workshopContentId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the `WorkshopContent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,workshopId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workshopId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ticketToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `workshopId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AttendanceMethod" ADD VALUE 'OFFICER_TICKET_SCAN';

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_workshopContentId_fkey";

-- DropForeignKey
ALTER TABLE "WorkshopContent" DROP CONSTRAINT "WorkshopContent_createdById_fkey";

-- DropForeignKey
ALTER TABLE "WorkshopContent" DROP CONSTRAINT "WorkshopContent_eventId_fkey";

-- DropIndex
DROP INDEX "Quiz_workshopContentId_key";

-- AlterTable
ALTER TABLE "AcademyResource" ADD COLUMN     "workshopId" TEXT;

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "workshopId" TEXT,
ALTER COLUMN "eventId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "workshopContentId",
ADD COLUMN     "workshopId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ticketToken" TEXT;

-- DropTable
DROP TABLE "WorkshopContent";

-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "checkInToken" TEXT NOT NULL,
    "recordingUrl" TEXT,
    "recordingStorageKey" TEXT,
    "summary" TEXT,
    "quizDueAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workshop_checkInToken_key" ON "Workshop"("checkInToken");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_workshopId_key" ON "Attendance"("userId", "workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_workshopId_key" ON "Quiz"("workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "User_ticketToken_key" ON "User"("ticketToken");

-- AddForeignKey
ALTER TABLE "Workshop" ADD CONSTRAINT "Workshop_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyResource" ADD CONSTRAINT "AcademyResource_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
