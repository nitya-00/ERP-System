import { getPrisma } from "../../config/database.js";

export function findUserByAuthUserId(authUserId: string) {
  return getPrisma().user.findFirst({
    where: { authUserId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: { include: { permission: true } },
            },
          },
        },
      },
    },
  });
}

export function recordSuccessfulLogin(userId: string) {
  return getPrisma().user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}
