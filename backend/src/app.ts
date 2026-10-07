/**
 * Backend composition point (not a runnable server in Phase 1).
 *
 * Implement this after choosing Fastify or NestJS. Keep it small: configuration,
 * global middleware, route registration, and graceful shutdown belong here.
 */
export const backendModules = [
  "identity",
  "admissions",
  "students",
  "academics",
  "attendance",
  "fees",
  "exams",
  "communication",
  "reports",
] as const;

export type BackendModule = (typeof backendModules)[number];
