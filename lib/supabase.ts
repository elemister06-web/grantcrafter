import { createClient } from "@supabase/supabase-js";

// Client-side client (limited access)
export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server-side admin client (full access — server only)
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Convenience named exports for existing imports
export const supabase = {
  get: getSupabase,
};

export const supabaseAdmin = {
  from: (table: string) => getSupabaseAdmin().from(table),
};
