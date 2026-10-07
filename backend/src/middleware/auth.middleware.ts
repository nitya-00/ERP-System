import type { NextFunction, Request, Response } from "express";

/**
 * Phase 2: verify the Supabase bearer token and attach the ERP user profile.
 * No request should rely on frontend role state as proof of identity.
 */
export function authenticate(_req: Request, _res: Response, next: NextFunction) {
  next(new Error("Authentication middleware is not implemented yet."));
}
