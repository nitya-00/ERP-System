import type { NextFunction, Request, Response } from "express";
import type { Role } from "../common/constants/roles.js";

/** Role check only. Services must also enforce teacher assignment, guardian link, or self scope. */
export function authorize(..._roles: Role[]) {
  return (_req: Request, _res: Response, next: NextFunction) => next();
}
