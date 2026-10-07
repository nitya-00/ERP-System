import type { NextFunction, Request, Response } from "express";
import type { Role } from "../common/constants/roles.js";
import { AppError } from "../common/errors/app-error.js";

/** Role check only. Services must also enforce teacher assignment, guardian link, or self scope. */
export function authorizeRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("UNAUTHENTICATED", "Authentication is required.", 401));
    if (!req.user.roles.some((role) => roles.includes(role))) {
      return next(new AppError("FORBIDDEN", "You do not have permission for this action.", 403));
    }
    return next();
  };
}

export function authorizePermissions(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("UNAUTHENTICATED", "Authentication is required.", 401));
    if (!permissions.every((permission) => req.user?.permissions.includes(permission))) {
      return next(new AppError("FORBIDDEN", "You do not have permission for this action.", 403));
    }
    return next();
  };
}
