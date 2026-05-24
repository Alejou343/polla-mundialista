import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE ROLE. Bypassea RLS.
 * Usar SOLO en:
 *  - Cron jobs (`/api/cron/*`) autenticados con CRON_SECRET.
 *  - Rutas admin (`/api/admin/*`) tras verificar is_admin.
 *  - Server Actions de signup (necesario para crear usuarios con email_confirm).
 *
 * NUNCA importar desde Client Components.
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Supabase admin: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
