import type { Role } from "../constants/roles.js";

export type AuthenticatedUser = {
  id: string;
  schoolId: string;
  authUserId: string;
  email: string;
  displayName: string | null;
  roles: Role[];
  permissions: string[];
};
