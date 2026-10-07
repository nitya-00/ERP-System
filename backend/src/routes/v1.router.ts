import { Router } from "express";
import { success } from "../common/utils/api-response.js";
import { authRouter } from "../modules/auth/auth.routes.js";

export const v1Router = Router();

v1Router.get("/", (_req, res) => {
  return success(res, { version: "v1", status: "identity-ready" });
});

v1Router.use("/auth", authRouter);

// Domain routers mount here as their approved implementation phases begin.
