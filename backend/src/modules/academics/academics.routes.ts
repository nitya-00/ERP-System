import { Router } from "express";
import { PERMISSIONS } from "../../common/constants/roles.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizePermissions } from "../../middleware/authorization.middleware.js";
import * as controller from "./academics.controller.js";

export const academicsRouter = Router();

academicsRouter.use(authenticate, authorizePermissions(PERMISSIONS.ACADEMICS_MANAGE));
academicsRouter.get("/setup", controller.getSetup);
academicsRouter.post("/academic-years", controller.postAcademicYear);
academicsRouter.patch("/academic-years/:id", controller.patchAcademicYear);
academicsRouter.post("/classes", controller.postClass);
academicsRouter.patch("/classes/:id", controller.patchClass);
academicsRouter.post("/classes/:classId/sections", controller.postSection);
academicsRouter.patch("/sections/:id", controller.patchSection);
academicsRouter.post("/subjects", controller.postSubject);
academicsRouter.patch("/subjects/:id", controller.patchSubject);
academicsRouter.put("/class-subjects", controller.putClassSubject);
