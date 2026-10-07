import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  base: undefined,
  redact: ["req.headers.authorization", "password", "passwordHash", "token"],
});
