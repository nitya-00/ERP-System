import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { getCurrentUser } from "./auth.controller.js";

export const authRouter = Router();

authRouter.get("/me", authenticate, getCurrentUser);
