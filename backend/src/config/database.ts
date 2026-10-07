import { PrismaClient } from "@prisma/client";
import { requireDatabaseUrl } from "./env.js";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

/**
 * One Prisma client per running API process. Import this client from repositories;
 * never instantiate PrismaClient inside a request handler.
 */
export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: { db: { url: requireDatabaseUrl() } },
    });
  }

  return globalForPrisma.prisma;
}
