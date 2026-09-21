/*
  Warnings:

  - Made the column `ticketToken` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "visibilityMembership" "MembershipType"[] DEFAULT ARRAY[]::"MembershipType"[],
ADD COLUMN     "visibilityRoles" "UserRole"[] DEFAULT ARRAY['MEMBER']::"UserRole"[],
ADD COLUMN     "visibilityTeams" "TEAM"[] DEFAULT ARRAY[]::"TEAM"[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "ticketToken" SET NOT NULL;
