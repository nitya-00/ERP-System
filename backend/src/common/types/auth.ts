import type { Role } from "../constants/roles.js";

export type AuthenticatedUser = {
  id: string;
  schoolId: string;
  role: Role;
  permissions: string[];
};
