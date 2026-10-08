import { AcademicYearStatus, RecordStatus } from "@prisma/client";
import { z } from "zod";

const id = z.string().cuid();
const nonEmptyName = z.string().trim().min(1).max(100);

const academicYearFields = z.object({
  name: z.string().trim().regex(/^\d{4}-\d{2}$/, "Use the format YYYY-YY, for example 2026-27."),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.boolean().optional(),
  status: z.nativeEnum(AcademicYearStatus).optional(),
});

export const createAcademicYearSchema = academicYearFields.refine((value) => value.endDate > value.startDate, {
  message: "endDate must be after startDate.",
  path: ["endDate"],
});

export const updateAcademicYearSchema = academicYearFields.partial().refine(
  (value) => !value.startDate || !value.endDate || value.endDate > value.startDate,
  { message: "endDate must be after startDate.", path: ["endDate"] },
);

export const createClassSchema = z.object({
  name: nonEmptyName,
  displayOrder: z.number().int().min(1).max(100),
  status: z.nativeEnum(RecordStatus).optional(),
});
export const updateClassSchema = createClassSchema.partial();

export const createSectionSchema = z.object({
  name: nonEmptyName.max(20),
  room: z.string().trim().max(50).nullable().optional(),
  capacity: z.number().int().positive().max(500).nullable().optional(),
  status: z.nativeEnum(RecordStatus).optional(),
});
export const updateSectionSchema = createSectionSchema.partial();

export const createSubjectSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{2,20}$/),
  name: nonEmptyName,
  description: z.string().trim().max(500).nullable().optional(),
  status: z.nativeEnum(RecordStatus).optional(),
});
export const updateSubjectSchema = createSubjectSchema.partial();

export const upsertClassSubjectSchema = z.object({
  academicYearId: id,
  classId: id,
  subjectId: id,
  isRequired: z.boolean().optional(),
  maximumMarks: z.number().int().positive().max(1000).nullable().optional(),
});

export const idParamSchema = z.object({ id });
export const classIdParamSchema = z.object({ classId: id });
