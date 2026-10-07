import type { Request } from "express";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "../../src/common/errors/app-error.js";
import { authorizePermissions, authorizeRoles } from "../../src/middleware/authorization.middleware.js";

const user = {
  id: "user-1",
  schoolId: "school-1",
  authUserId: "auth-1",
  email: "teacher@example.com",
  displayName: "Teacher",
  roles: ["TEACHER" as const],
  permissions: ["ATTENDANCE_CREATE"],
};

describe("authorization middleware", () => {
  it("allows a user with the required role and permission", () => {
    const next = vi.fn();
    authorizeRoles("TEACHER")({ user } as Request, {} as never, next);
    authorizePermissions("ATTENDANCE_CREATE")({ user } as Request, {} as never, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("denies a teacher an admin-only role", () => {
    const next = vi.fn();
    authorizeRoles("ADMIN")({ user } as Request, {} as never, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe("FORBIDDEN");
  });
});
