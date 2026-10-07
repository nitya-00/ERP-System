import { Router } from "express";
import { success } from "../common/utils/api-response.js";

export const v1Router = Router();

v1Router.get("/", (_req, res) => {
  return success(res, { version: "v1", status: "foundation" });
});

// Domain routers will mount here as their approved implementation phases begin.
