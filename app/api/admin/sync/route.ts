import { NextResponse } from "next/server";
import { fetchFixtures } from "@/lib/openfootball";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { calculatePoints } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const KNOCKOUT = ["r32", "r16", "qf", "sf", "final", "third"];

async function requireAdminUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return profile?.is_admin ? user : null;
}

/**
 * Sync manual on-demand (botón admin). Igual que el cron diario pero a voluntad:
 * trae openfootball, resuelve placeholders de eliminatorias (rellenando códigos
 * y winner_code), repunta apuestas de cruces resueltos, y recalcula los puntos
 * de los partidos que quedaron finalizados. No toca partidos ya finalizados
 * (preserva su marcador).
 */
export async function POST() {
  const user = await requireAdminUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminSupabaseClient();

  let fixtures;
  try {
    fixtures = await fetchFixtures();
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch error";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  const { data: existing, error: exErr } = await admin
    .from("matches")
    .select("id, match_number, stage, status, home_score, away_score");
  if (exErr) {
    return NextResponse.json({ ok: false, error: exErr.message }, { status: 500 });
  }
  const priorById = new Map((existing ?? []).map((e) => [e.id, e]));

  const rows = fixtures.map((m) => {
    const prior = priorById.get(m.id);
    const locked = prior?.status === "finished";
    return {
      id: m.id,
      stage: m.stage,
      group_name: m.group_name,
      match_number: m.match_number,
      home_team: m.home_team,
      away_team: m.away_team,
      home_team_code: m.home_team_code,
      away_team_code: m.away_team_code,
      venue: m.venue,
      kickoff_time: m.kickoff_time,
      status: locked ? "finished" : m.status,
      home_score: locked ? prior!.home_score : m.home_score,
      away_score: locked ? prior!.away_score : m.away_score,
      winner_code: m.winner_code,
    };
  });

  const { error: upErr } = await admin.from("matches").upsert(rows, { onConflict: "id" });
  if (upErr) {
    return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
  }

  // Reconciliar eliminatorias: borrar filas placeholder obsoletas, repuntando
  // apuestas al cruce resuelto (misma predicción).
  const freshIds = new Set(fixtures.map((f) => f.id));
  const freshIdByNum = new Map(
    fixtures.filter((f) => KNOCKOUT.includes(f.stage)).map((f) => [f.match_number, f.id]),
  );
  const stale = (existing ?? []).filter(
    (e) => KNOCKOUT.includes(e.stage) && !freshIds.has(e.id) && e.status !== "finished",
  );
  let resolved = 0;
  let repointed = 0;
  if (stale.length > 0) {
    const staleIds = stale.map((s) => s.id);
    const numById = new Map(stale.map((s) => [s.id, s.match_number]));
    const { data: bets } = await admin.from("bets").select("id, match_id").in("match_id", staleIds);
    for (const b of bets ?? []) {
      const target = freshIdByNum.get(numById.get(b.match_id)!);
      if (target) {
        const { error } = await admin.from("bets").update({ match_id: target }).eq("id", b.id);
        if (!error) repointed++;
      }
    }
    const { error: delErr } = await admin.from("matches").delete().in("id", staleIds);
    if (!delErr) resolved = staleIds.length;
  }

  // Recalcular puntos de los partidos que quedaron finalizados en este sync
  // (nuevos o con marcador cambiado). Idempotente: recalcula desde cero.
  const changed = fixtures.filter((m) => {
    if (m.status !== "finished" || m.home_score === null || m.away_score === null) return false;
    const prior = priorById.get(m.id);
    return (
      !prior ||
      prior.status !== "finished" ||
      prior.home_score !== m.home_score ||
      prior.away_score !== m.away_score
    );
  });

  let scored = 0;
  let recalculated = 0;
  for (const m of changed) {
    const { data: bets } = await admin
      .from("bets")
      .select("id, predicted_home_score, predicted_away_score")
      .eq("match_id", m.id);
    for (const b of bets ?? []) {
      const pts = calculatePoints(
        b.predicted_home_score,
        b.predicted_away_score,
        m.home_score!,
        m.away_score!,
      );
      const { error } = await admin.from("bets").update({ points_earned: pts }).eq("id", b.id);
      if (!error) recalculated++;
    }
    await admin.from("matches").update({ scored_at: new Date().toISOString() }).eq("id", m.id);
    scored++;
  }

  return NextResponse.json({
    ok: true,
    total: rows.length,
    resolved,
    repointed,
    scored,
    recalculated,
  });
}
