import { PERMISSIONS, ROLES } from "../../common/constants/roles.js";
import { getPrisma } from "../../config/database.js";

async function main() {
  const prisma = getPrisma();
  const school = await prisma.school.upsert({
    where: { code: "NHATC" },
    update: { name: "The New Horizon Academy and Technology Center" },
    create: {
      code: "NHATC",
      name: "The New Horizon Academy and Technology Center",
      timezone: "Asia/Kolkata",
      currency: "INR",
    },
  });

  await prisma.academicYear.updateMany({
    where: { schoolId: school.id, isCurrent: true, name: { not: "2026-27" } },
    data: { isCurrent: false },
  });
  const academicYear = await prisma.academicYear.upsert({
    where: { schoolId_name: { schoolId: school.id, name: "2026-27" } },
    update: { startDate: new Date("2026-04-01T00:00:00.000Z"), endDate: new Date("2027-03-31T00:00:00.000Z"), isCurrent: true, status: "ACTIVE" },
    create: {
      schoolId: school.id,
      name: "2026-27",
      startDate: new Date("2026-04-01T00:00:00.000Z"),
      endDate: new Date("2027-03-31T00:00:00.000Z"),
      isCurrent: true,
      status: "ACTIVE",
    },
  });

  const classSections = [
    ["Nursery", ["A"]], ["LKG", ["A"]], ["UKG", ["A"]],
    ["1st", ["A", "B"]], ["2nd", ["A", "B"]], ["3rd", ["A", "B"]],
    ["4th", ["A", "B"]], ["5th", ["A", "B"]],
    ["6th", ["A"]], ["7th", ["A"]], ["8th", ["A"]],
  ] as const;

  for (const [index, [name, sections]] of classSections.entries()) {
    const schoolClass = await prisma.schoolClass.upsert({
      where: { schoolId_name: { schoolId: school.id, name } },
      update: { displayOrder: index + 1, status: "ACTIVE" },
      create: { schoolId: school.id, name, displayOrder: index + 1, status: "ACTIVE" },
    });
    for (const sectionName of sections) {
      await prisma.section.upsert({
        where: { classId_name: { classId: schoolClass.id, name: sectionName } },
        update: { status: "ACTIVE" },
        create: { schoolId: school.id, classId: schoolClass.id, name: sectionName, status: "ACTIVE" },
      });
    }
  }

  const subjectCatalog = [
    ["ENG", "English"], ["HIN", "Hindi"], ["MAT", "Mathematics"],
    ["SCI", "Science"], ["SST", "Social Science"], ["CSC", "Computer Science"],
    ["ART", "Art and Craft"], ["PED", "Physical Education"],
  ] as const;
  let englishId = "";
  for (const [code, name] of subjectCatalog) {
    const subject = await prisma.subject.upsert({
      where: { schoolId_code: { schoolId: school.id, code } },
      update: { name, status: "ACTIVE" },
      create: { schoolId: school.id, code, name, status: "ACTIVE" },
    });
    if (code === "ENG") englishId = subject.id;
  }

  // English is the only confirmed class-subject mapping. Other mappings wait for school confirmation.
  const classes = await prisma.schoolClass.findMany({ where: { schoolId: school.id }, select: { id: true } });
  for (const schoolClass of classes) {
    await prisma.classSubject.upsert({
      where: { academicYearId_classId_subjectId: { academicYearId: academicYear.id, classId: schoolClass.id, subjectId: englishId } },
      update: { isRequired: true },
      create: { schoolId: school.id, academicYearId: academicYear.id, classId: schoolClass.id, subjectId: englishId, isRequired: true },
    });
  }

  for (const key of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  }

  const permissionByRole = {
    ADMIN: Object.values(PERMISSIONS),
    TEACHER: [PERMISSIONS.TEACHER_VIEW_ASSIGNED_CLASS, PERMISSIONS.ATTENDANCE_CREATE, PERMISSIONS.ATTENDANCE_UPDATE, PERMISSIONS.MARKS_CREATE, PERMISSIONS.MARKS_UPDATE],
    PARENT: [PERMISSIONS.ATTENDANCE_VIEW_SELF, PERMISSIONS.RESULT_VIEW_SELF, PERMISSIONS.FEE_VIEW_SELF],
  } as const;

  for (const key of ROLES) {
    const role = await prisma.role.upsert({ where: { key }, update: {}, create: { key, name: key } });
    const permissions = await prisma.permission.findMany({
      where: { key: { in: [...permissionByRole[key]] } },
      select: { id: true },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
    });
  }
}

main()
  .then(() => getPrisma().$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await getPrisma().$disconnect();
    process.exit(1);
  });
