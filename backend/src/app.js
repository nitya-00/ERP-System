import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFound } from "./common/middleware/error-handler.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "school-erp-api" });
});

// Phase 2: mount auth and feature routers here under /api/v1.
app.use(notFound);
app.use(errorHandler);

export default app;
