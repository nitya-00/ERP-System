import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { requestId } from "./middleware/request-id.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestId);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", service: "school-erp-api" } });
});

// Feature routers mount below /api/v1 as their modules are implemented.
app.use(notFound);
app.use(errorHandler);

export default app;
