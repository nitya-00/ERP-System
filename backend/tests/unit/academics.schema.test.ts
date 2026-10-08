import { describe, expect, it } from "vitest";
import { createAcademicYearSchema, createSubjectSchema, upsertClassSubjectSchema } from "../../src/modules/academics/academics.schema.js";

describe("academic setup validation", () => {
  it("requires a valid academic-year date range", () => {
    expect(() => createAcademicYearSchema.parse({
      name: "2026-27", startDate: "2027-03-31", endDate: "2026-04-01",
    })).toThrow("endDate must be after startDate");
  });

  it("normalizes subject codes and rejects unsafe values", () => {
    expect(createSubjectSchema.parse({ code: " eng ", name: "English" }).code).toBe("ENG");
    expect(() => createSubjectSchema.parse({ code: "english subject", name: "English" })).toThrow();
  });

  it("requires valid identifiers for a class-subject mapping", () => {
    expect(() => upsertClassSubjectSchema.parse({ academicYearId: "not-an-id", classId: "not-an-id", subjectId: "not-an-id" })).toThrow();
  });
});
