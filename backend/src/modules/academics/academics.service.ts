import { AppError } from "../../common/errors/app-error.js";
import { getPrisma } from "../../config/database.js";
import { recordAuditEvent } from "../audit/audit.service.js";
import { findAcademicSetup, getAcademicYear, getSchoolClass, getSection, getSubject } from "./academics.repository.js";
import type {
  createAcademicYearSchema,
  createClassSchema,
  createSectionSchema,
  createSubjectSchema,
  updateAcademicYearSchema,
  updateClassSchema,
  updateSectionSchema,
  updateSubjectSchema,
  upsertClassSubjectSchema,
} from "./academics.schema.js";
import type { Request } from "express";
import type { z } from "zod";

type Actor = { id: string; schoolId: string };
type CreateAcademicYear = z.infer<typeof createAcademicYearSchema>;
type UpdateAcademicYear = z.infer<typeof updateAcademicYearSchema>;
type CreateClass = z.infer<typeof createClassSchema>;
type UpdateClass = z.infer<typeof updateClassSchema>;
type CreateSection = z.infer<typeof createSectionSchema>;
type UpdateSection = z.infer<typeof updateSectionSchema>;
type CreateSubject = z.infer<typeof createSubjectSchema>;
type UpdateSubject = z.infer<typeof updateSubjectSchema>;
type UpsertClassSubject = z.infer<typeof upsertClassSubjectSchema>;

function missing(entity: string): never {
  throw new AppError("NOT_FOUND", `${entity} was not found in your school.`, 404);
}

async function audit(actor: Actor, request: Request, action: string, entityType: string, entityId: string) {
  await recordAuditEvent({ schoolId: actor.schoolId, actorId: actor.id, action, entityType, entityId, request });
}

export async function readAcademicSetup(schoolId: string) {
  const school = await findAcademicSetup(schoolId);
  if (!school) missing("School");
  return school;
}

export async function createAcademicYear(actor: Actor, input: CreateAcademicYear, request: Request) {
  if (input.status === "CLOSED" && input.isCurrent) {
    throw new AppError("VALIDATION_ERROR", "A closed academic year cannot be current.", 400);
  }
  const prisma = getPrisma();
  const academicYear = await prisma.$transaction(async (tx) => {
    if (input.isCurrent) await tx.academicYear.updateMany({ where: { schoolId: actor.schoolId, isCurrent: true }, data: { isCurrent: false } });
    return tx.academicYear.create({ data: { ...input, schoolId: actor.schoolId } });
  });
  await audit(actor, request, "ACADEMIC_YEAR_CREATED", "ACADEMIC_YEAR", academicYear.id);
  return academicYear;
}

export async function updateAcademicYear(actor: Actor, id: string, input: UpdateAcademicYear, request: Request) {
  const existing = await getAcademicYear(actor.schoolId, id);
  if (!existing) missing("Academic year");
  const startDate = input.startDate ?? existing.startDate;
  const endDate = input.endDate ?? existing.endDate;
  if (endDate <= startDate) {
    throw new AppError("VALIDATION_ERROR", "endDate must be after startDate.", 400);
  }
  if ((input.status ?? existing.status) === "CLOSED" && input.isCurrent) {
    throw new AppError("VALIDATION_ERROR", "A closed academic year cannot be current.", 400);
  }
  const prisma = getPrisma();
  const academicYear = await prisma.$transaction(async (tx) => {
    if (input.isCurrent) await tx.academicYear.updateMany({ where: { schoolId: actor.schoolId, isCurrent: true, id: { not: id } }, data: { isCurrent: false } });
    return tx.academicYear.update({ where: { id }, data: { ...input, ...(input.status === "CLOSED" ? { isCurrent: false } : {}) } });
  });
  await audit(actor, request, "ACADEMIC_YEAR_UPDATED", "ACADEMIC_YEAR", id);
  return academicYear;
}

export async function createSchoolClass(actor: Actor, input: CreateClass, request: Request) {
  const item = await getPrisma().schoolClass.create({ data: { ...input, schoolId: actor.schoolId } });
  await audit(actor, request, "CLASS_CREATED", "CLASS", item.id);
  return item;
}

export async function updateSchoolClass(actor: Actor, id: string, input: UpdateClass, request: Request) {
  if (!await getSchoolClass(actor.schoolId, id)) missing("Class");
  const item = await getPrisma().schoolClass.update({ where: { id }, data: input });
  await audit(actor, request, "CLASS_UPDATED", "CLASS", id);
  return item;
}

export async function createSection(actor: Actor, classId: string, input: CreateSection, request: Request) {
  if (!await getSchoolClass(actor.schoolId, classId)) missing("Class");
  const item = await getPrisma().section.create({ data: { ...input, classId, schoolId: actor.schoolId } });
  await audit(actor, request, "SECTION_CREATED", "SECTION", item.id);
  return item;
}

export async function updateSection(actor: Actor, id: string, input: UpdateSection, request: Request) {
  if (!await getSection(actor.schoolId, id)) missing("Section");
  const item = await getPrisma().section.update({ where: { id }, data: input });
  await audit(actor, request, "SECTION_UPDATED", "SECTION", id);
  return item;
}

export async function createSubject(actor: Actor, input: CreateSubject, request: Request) {
  const item = await getPrisma().subject.create({ data: { ...input, schoolId: actor.schoolId } });
  await audit(actor, request, "SUBJECT_CREATED", "SUBJECT", item.id);
  return item;
}

export async function updateSubject(actor: Actor, id: string, input: UpdateSubject, request: Request) {
  if (!await getSubject(actor.schoolId, id)) missing("Subject");
  const item = await getPrisma().subject.update({ where: { id }, data: input });
  await audit(actor, request, "SUBJECT_UPDATED", "SUBJECT", id);
  return item;
}

export async function saveClassSubject(actor: Actor, input: UpsertClassSubject, request: Request) {
  const [academicYear, schoolClass, subject] = await Promise.all([
    getAcademicYear(actor.schoolId, input.academicYearId), getSchoolClass(actor.schoolId, input.classId), getSubject(actor.schoolId, input.subjectId),
  ]);
  if (!academicYear) missing("Academic year");
  if (!schoolClass) missing("Class");
  if (!subject) missing("Subject");
  const item = await getPrisma().classSubject.upsert({
    where: { academicYearId_classId_subjectId: { academicYearId: input.academicYearId, classId: input.classId, subjectId: input.subjectId } },
    update: { isRequired: input.isRequired, maximumMarks: input.maximumMarks },
    create: { ...input, schoolId: actor.schoolId },
  });
  await audit(actor, request, "CLASS_SUBJECT_SAVED", "CLASS_SUBJECT", item.id);
  return item;
}
