import type { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors/app-error.js";
import { resolveAuthenticatedUser } from "../modules/auth/auth.service.js";

/**
 * Phase 2: verify the Supabase bearer token and attach the ERP user profile.
 * No request should rely on frontend role state as proof of identity.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.header("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError("UNAUTHENTICATED", "Authentication is required.", 401);
    }

    req.user = await resolveAuthenticatedUser(authorization.slice("Bearer ".length));
    next();
  } catch (error) {
    next(error);
  }
}
