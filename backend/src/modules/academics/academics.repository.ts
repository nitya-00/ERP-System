import type { Prisma } from "@prisma/client";
import { getPrisma } from "../../config/database.js";

const setupInclude = {
  academicYears: { orderBy: { startDate: "desc" } },
  classes: { orderBy: { displayOrder: "asc" }, include: { sections: { orderBy: { name: "asc" } } } },
  subjects: { orderBy: { name: "asc" } },
  classSubjects: {
    orderBy: [{ academicYear: { startDate: "desc" } }, { class: { displayOrder: "asc" } }, { subject: { name: "asc" } }],
    include: { academicYear: true, class: true, subject: true },
  },
} satisfies Prisma.SchoolInclude;

export function findAcademicSetup(schoolId: string) {
  return getPrisma().school.findUnique({ where: { id: schoolId }, include: setupInclude });
}

export function getAcademicYear(schoolId: string, id: string) {
  return getPrisma().academicYear.findFirst({ where: { id, schoolId } });
}

export function getSchoolClass(schoolId: string, id: string) {
  return getPrisma().schoolClass.findFirst({ where: { id, schoolId } });
}

export function getSection(schoolId: string, id: string) {
  return getPrisma().section.findFirst({ where: { id, schoolId } });
}

export function getSubject(schoolId: string, id: string) {
  return getPrisma().subject.findFirst({ where: { id, schoolId } });
}
