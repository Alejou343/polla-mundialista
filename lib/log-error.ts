import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type ErrorLogEntry = {
  action: string;
  code?: string;
  message?: string;
  userId?: string | null;
  matchId?: string | null;
  payload?: Record<string, unknown> | null;
};

/**
 * Persiste un error en la tabla public.error_log usando service role (bypass RLS).
 *
 * Esta función NUNCA lanza — si el log falla, lo escribe a console.error y sigue.
 * No bloquees flujo de usuario por logging.
 *
 * Uso típico desde un Server Action:
 *   try {
 *     // ...lógica
 *   } catch (e) {
 *     await logError({ action: 'placeBet', code: 'unknown', message: String(e), userId, matchId });
 *     return { ok: false, error: 'No se pudo guardar la apuesta' };
 *   }
 */
export async function logError(entry: ErrorLogEntry): Promise<void> {
  try {
    const admin = createAdminSupabaseClient();
    const { error } = await admin.from("error_log").insert({
      action: entry.action,
      code: entry.code ?? null,
      message: entry.message ?? null,
      user_id: entry.userId ?? null,
      match_id: entry.matchId ?? null,
      payload: entry.payload ?? null,
    });
    if (error) {
      console.error("[log-error] insert failed:", error.message, entry);
    }
  } catch (e) {
    console.error("[log-error] catastrophic:", e, entry);
  }
}
