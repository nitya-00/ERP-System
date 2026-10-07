export type ApiIdentity = {
  id: string;
  schoolId: string;
  authUserId: string;
  email: string;
  displayName: string | null;
  roles: string[];
  permissions: string[];
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

export async function getCurrentIdentity(accessToken: string): Promise<ApiIdentity> {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json() as { success: boolean; data?: ApiIdentity; error?: { message?: string } };
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.error?.message ?? "Unable to load your ERP account.");
  }
  return body.data;
}
