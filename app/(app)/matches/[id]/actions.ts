"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/types";

const BetSchema = z.object({
  matchId: z.string().min(1),
  predictedHome: z.number().int().min(0).max(20),
  predictedAway: z.number().int().min(0).max(20),
});

function parseFormData(formData: FormData) {
  const home = Number(formData.get("predictedHome"));
  const away = Number(formData.get("predictedAway"));
  const matchId = String(formData.get("matchId") ?? "");
  return BetSchema.safeParse({
    matchId,
    predictedHome: home,
    predictedAway: away,
  });
}

export async function placeBetAction(
  _prevState: Result<{ saved: true }> | null,
  formData: FormData,
): Promise<Result<{ saved: true }>> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { ok: false, error: "Marcador inválido (entre 0 y 20)." };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  // Defensa en profundidad: revalidar kickoff aquí, además de RLS.
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .select("kickoff_time, status")
    .eq("id", parsed.data.matchId)
    .single();
  if (matchErr || !match) return { ok: false, error: "Partido no encontrado." };
  if (new Date(match.kickoff_time) <= new Date()) {
    return { ok: false, error: "Apuestas cerradas para este partido." };
  }

  const { error } = await supabase.from("bets").upsert(
    {
      user_id: user.id,
      match_id: parsed.data.matchId,
      predicted_home_score: parsed.data.predictedHome,
      predicted_away_score: parsed.data.predictedAway,
    },
    { onConflict: "user_id,match_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/matches");
  revalidatePath(`/matches/${parsed.data.matchId}`);
  return { ok: true, data: { saved: true } };
}

export async function deleteBetAction(matchId: string): Promise<Result<null>> {
  if (!matchId) return { ok: false, error: "Falta matchId." };

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { data: match } = await supabase
    .from("matches")
    .select("kickoff_time")
    .eq("id", matchId)
    .single();
  if (!match) return { ok: false, error: "Partido no encontrado." };
  if (new Date(match.kickoff_time) <= new Date()) {
    return { ok: false, error: "Apuestas cerradas para este partido." };
  }

  const { error } = await supabase
    .from("bets")
    .delete()
    .eq("user_id", user.id)
    .eq("match_id", matchId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}`);
  return { ok: true, data: null };
}
