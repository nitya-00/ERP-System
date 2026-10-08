import { createRemoteJWKSet, jwtVerify } from "jose";
import { AppError } from "../../common/errors/app-error.js";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import { ROLES, type Role } from "../../common/constants/roles.js";
import { env } from "../../config/env.js";
import { recordSuccessfulLogin, findUserByAuthUserId } from "../users/users.repository.js";
import { recordAuditEvent } from "../audit/audit.service.js";

type VerifiedToken = { authUserId: string; email?: string };
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function configuredIssuer() {
  if (!env.SUPABASE_JWT_ISSUER) {
    throw new AppError("AUTH_NOT_CONFIGURED", "Supabase JWT verification is not configured.", 503);
  }
  return env.SUPABASE_JWT_ISSUER.replace(/\/$/, "");
}

export async function verifyAccessToken(token: string): Promise<VerifiedToken> {
  const issuer = configuredIssuer();
  jwks ??= createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  let payload: Awaited<ReturnType<typeof jwtVerify>>["payload"];
  try {
    ({ payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: env.SUPABASE_JWT_AUDIENCE,
    }));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("INVALID_TOKEN", "The access token is invalid or expired.", 401);
  }

  if (!payload.sub) {
    throw new AppError("INVALID_TOKEN", "The access token does not identify a user.", 401);
  }
  return { authUserId: payload.sub, email: typeof payload.email === "string" ? payload.email : undefined };
}

export async function resolveAuthenticatedUser(token: string): Promise<AuthenticatedUser> {
  const tokenUser = await verifyAccessToken(token);
  const user = await findUserByAuthUserId(tokenUser.authUserId);

  if (!user) throw new AppError("ERP_USER_NOT_FOUND", "This account is not provisioned for the ERP.", 403);
  if (user.status !== "ACTIVE") throw new AppError("ACCOUNT_INACTIVE", "This ERP account is not active.", 403);

  const roles = user.roles
    .map(({ role }) => role.key)
    .filter((role): role is Role => (ROLES as readonly string[]).includes(role));
  const permissions = [...new Set(user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)))];

  if (roles.length === 0) throw new AppError("ERP_ROLE_NOT_ASSIGNED", "This account has no ERP role assigned.", 403);

  const isNewSession = !user.lastLoginAt || Date.now() - user.lastLoginAt.getTime() > 5 * 60 * 1000;
  await recordSuccessfulLogin(user.id);
  if (isNewSession) {
    await recordAuditEvent({
      schoolId: user.schoolId,
      actorId: user.id,
      action: "AUTH_SESSION_VERIFIED",
      entityType: "USER",
      entityId: user.id,
    });
  }

  return {
    id: user.id,
    schoolId: user.schoolId,
    authUserId: user.authUserId,
    email: user.email,
    displayName: user.displayName,
    roles,
    permissions,
  };
}
