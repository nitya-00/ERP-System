import type { Request, Response } from "express";
import { success } from "../../common/utils/api-response.js";
import {
  createAcademicYearSchema, createClassSchema, createSectionSchema, createSubjectSchema,
  idParamSchema, classIdParamSchema, updateAcademicYearSchema, updateClassSchema,
  updateSectionSchema, updateSubjectSchema, upsertClassSubjectSchema,
} from "./academics.schema.js";
import * as academics from "./academics.service.js";

function actor(req: Request) {
  if (!req.user) throw new Error("Authenticated user is required before this controller.");
  return req.user;
}

export async function getSetup(req: Request, res: Response) { return success(res, await academics.readAcademicSetup(actor(req).schoolId)); }
export async function postAcademicYear(req: Request, res: Response) { return success(res, await academics.createAcademicYear(actor(req), createAcademicYearSchema.parse(req.body), req), 201); }
export async function patchAcademicYear(req: Request, res: Response) { return success(res, await academics.updateAcademicYear(actor(req), idParamSchema.parse(req.params).id, updateAcademicYearSchema.parse(req.body), req)); }
export async function postClass(req: Request, res: Response) { return success(res, await academics.createSchoolClass(actor(req), createClassSchema.parse(req.body), req), 201); }
export async function patchClass(req: Request, res: Response) { return success(res, await academics.updateSchoolClass(actor(req), idParamSchema.parse(req.params).id, updateClassSchema.parse(req.body), req)); }
export async function postSection(req: Request, res: Response) { return success(res, await academics.createSection(actor(req), classIdParamSchema.parse(req.params).classId, createSectionSchema.parse(req.body), req), 201); }
export async function patchSection(req: Request, res: Response) { return success(res, await academics.updateSection(actor(req), idParamSchema.parse(req.params).id, updateSectionSchema.parse(req.body), req)); }
export async function postSubject(req: Request, res: Response) { return success(res, await academics.createSubject(actor(req), createSubjectSchema.parse(req.body), req), 201); }
export async function patchSubject(req: Request, res: Response) { return success(res, await academics.updateSubject(actor(req), idParamSchema.parse(req.params).id, updateSubjectSchema.parse(req.body), req)); }
export async function putClassSubject(req: Request, res: Response) { return success(res, await academics.saveClassSubject(actor(req), upsertClassSubjectSchema.parse(req.body), req)); }
