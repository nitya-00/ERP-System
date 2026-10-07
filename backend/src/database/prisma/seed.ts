import { PERMISSIONS, ROLES } from "../../common/constants/roles.js";
import { getPrisma } from "../../config/database.js";

async function main() {
  const prisma = getPrisma();
  await prisma.school.upsert({
    where: { code: "DEMO-SCHOOL" },
    update: {},
    create: {
      code: "DEMO-SCHOOL",
      name: "Demo School",
      timezone: "Asia/Kolkata",
      currency: "INR",
    },
  });

  for (const key of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  }

  const permissionByRole = {
    ADMIN: Object.values(PERMISSIONS),
    TEACHER: [PERMISSIONS.TEACHER_VIEW_ASSIGNED_CLASS, PERMISSIONS.ATTENDANCE_CREATE, PERMISSIONS.ATTENDANCE_UPDATE, PERMISSIONS.MARKS_CREATE, PERMISSIONS.MARKS_UPDATE],
    PARENT: [PERMISSIONS.STUDENT_VIEW_SELF, PERMISSIONS.ATTENDANCE_VIEW_SELF, PERMISSIONS.RESULT_VIEW_SELF, PERMISSIONS.FEE_VIEW_SELF],
    STUDENT: [PERMISSIONS.STUDENT_VIEW_SELF, PERMISSIONS.ATTENDANCE_VIEW_SELF, PERMISSIONS.RESULT_VIEW_SELF, PERMISSIONS.FEE_VIEW_SELF],
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
