"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logError } from "@/lib/log-error";
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
  const rawHome = formData.get("predictedHome");
  const rawAway = formData.get("predictedAway");
  const rawMatchId = String(formData.get("matchId") ?? "");

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    await logError({
      action: "placeBet",
      code: "zod_validation",
      message: parsed.error.message,
      matchId: rawMatchId || null,
      payload: { rawHome: String(rawHome), rawAway: String(rawAway) },
    });
    return { ok: false, error: "Marcador inválido (entre 0 y 20)." };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    await logError({
      action: "placeBet",
      code: "no_auth",
      matchId: parsed.data.matchId,
    });
    return { ok: false, error: "No autenticado." };
  }

  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .select("kickoff_time, status")
    .eq("id", parsed.data.matchId)
    .single();
  if (matchErr || !match) {
    await logError({
      action: "placeBet",
      code: "match_not_found",
      message: matchErr?.message,
      userId: user.id,
      matchId: parsed.data.matchId,
    });
    return { ok: false, error: "Partido no encontrado." };
  }
  if (new Date(match.kickoff_time) <= new Date()) {
    await logError({
      action: "placeBet",
      code: "kickoff_passed",
      userId: user.id,
      matchId: parsed.data.matchId,
      payload: {
        kickoff_time: match.kickoff_time,
        attempted_at: new Date().toISOString(),
      },
    });
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
  if (error) {
    await logError({
      action: "placeBet",
      code: "db_error",
      message: error.message,
      userId: user.id,
      matchId: parsed.data.matchId,
      payload: {
        predicted_home: parsed.data.predictedHome,
        predicted_away: parsed.data.predictedAway,
      },
    });
    return { ok: false, error: error.message };
  }

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
  if (!user) {
    await logError({ action: "deleteBet", code: "no_auth", matchId });
    return { ok: false, error: "No autenticado." };
  }

  const { data: match } = await supabase
    .from("matches")
    .select("kickoff_time")
    .eq("id", matchId)
    .single();
  if (!match) {
    await logError({
      action: "deleteBet",
      code: "match_not_found",
      userId: user.id,
      matchId,
    });
    return { ok: false, error: "Partido no encontrado." };
  }
  if (new Date(match.kickoff_time) <= new Date()) {
    await logError({
      action: "deleteBet",
      code: "kickoff_passed",
      userId: user.id,
      matchId,
    });
    return { ok: false, error: "Apuestas cerradas para este partido." };
  }

  const { error } = await supabase
    .from("bets")
    .delete()
    .eq("user_id", user.id)
    .eq("match_id", matchId);
  if (error) {
    await logError({
      action: "deleteBet",
      code: "db_error",
      message: error.message,
      userId: user.id,
      matchId,
    });
    return { ok: false, error: error.message };
  }

  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}`);
  return { ok: true, data: null };
}
