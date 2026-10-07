import type { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors/app-error.js";
import { logger } from "../config/logger.js";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const knownError = error instanceof AppError ? error : undefined;
  const statusCode = knownError?.statusCode ?? 500;
  const code = knownError?.code ?? "INTERNAL_ERROR";
  const message = knownError?.message ?? "Unexpected server error";

  logger.error({ err: error, requestId: req.header("x-request-id"), code }, "Request failed");
  res.status(statusCode).json({
    success: false,
    error: { code, message, requestId: req.header("x-request-id") ?? undefined },
  });
}
