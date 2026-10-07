import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(url && anonKey && !url.includes("YOUR_PROJECT") && !anonKey.includes("YOUR_SUPABASE"));

let client: SupabaseClient | undefined;

export function getSupabaseClient() {
  if (!isAuthConfigured) {
    throw new Error("Authentication is not configured. Add Supabase values to frontend/.env.");
  }
  client ??= createClient(url!, anonKey!);
  return client;
}
