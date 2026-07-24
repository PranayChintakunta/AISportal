import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface LogParam {
  actorId: string;
  actionType: string; // e.g., "STATUS_UPDATE", "MANUAL_CHECKIN"
  entityType: string; // e.g., "ProgramApplication", "Attendance"
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

export async function logAction({ actorId, actionType, entityType, entityId, metadata }: LogParam) {
  return await prisma.auditLog.create({
    data: {
      actorUserId: actorId,
      actionType: actionType,
      entityType: entityType,
      entityId: entityId,
      metadataJson: metadata === undefined ? Prisma.JsonNull : metadata,
    },
  });
}