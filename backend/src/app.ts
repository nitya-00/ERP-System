import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { apiRateLimit } from "./middleware/rate-limit.middleware.js";
import { requestId } from "./middleware/request-id.middleware.js";
import { v1Router } from "./routes/v1.router.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN }));
app.use(requestId);
app.use(pinoHttp({ logger, genReqId: (req) => String(req.headers["x-request-id"] ?? "") }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", service: "school-erp-api" } });
});

app.use("/api/v1", apiRateLimit, v1Router);

// Feature routers mount below /api/v1 as their approved implementation phases begin.
app.use(notFound);
app.use(errorHandler);

export default app;
