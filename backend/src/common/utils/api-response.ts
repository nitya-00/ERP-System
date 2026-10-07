import type { Response } from "express";
import type { SuccessResponse } from "../types/api.js";

export function success<T>(res: Response, data: T, statusCode = 200) {
  const body: SuccessResponse<T> = { success: true, data };
  return res.status(statusCode).json(body);
}
