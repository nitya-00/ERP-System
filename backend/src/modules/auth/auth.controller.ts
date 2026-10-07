import type { Request, Response } from "express";
import { success } from "../../common/utils/api-response.js";

export function getCurrentUser(req: Request, res: Response) {
  return success(res, req.user);
}
