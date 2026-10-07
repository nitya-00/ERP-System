import type { Request } from "express";
import { getPrisma } from "../../config/database.js";

export function recordAuditEvent(input: {
  schoolId: string;
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  request?: Request;
}) {
  return getPrisma().auditLog.create({
    data: {
      schoolId: input.schoolId,
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      ipAddress: input.request?.ip,
      userAgent: input.request?.header("user-agent") ?? undefined,
    },
  });
}
