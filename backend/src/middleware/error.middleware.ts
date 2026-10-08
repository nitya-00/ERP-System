import type { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors/app-error.js";
import { logger } from "../config/logger.js";
import { ZodError } from "zod";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const knownError = error instanceof AppError ? error : undefined;
  const validationError = error instanceof ZodError ? error : undefined;
  const statusCode = knownError?.statusCode ?? (validationError ? 400 : 500);
  const code = knownError?.code ?? (validationError ? "VALIDATION_ERROR" : "INTERNAL_ERROR");
  const message = knownError?.message ?? (validationError ? "Request validation failed." : "Unexpected server error");

  logger.error({ err: error, requestId: req.header("x-request-id"), code }, "Request failed");
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(validationError ? { details: validationError.flatten() } : {}),
      requestId: req.header("x-request-id") ?? undefined,
    },
  });
}
