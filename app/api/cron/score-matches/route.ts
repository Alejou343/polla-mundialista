import { NextResponse } from "next/server";
import { fetchFixtures } from "@/lib/openfootball";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { calculatePoints } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();

  // Margen de 2h tras el kickoff para asegurarnos de que el partido terminó.
  const cutoffIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: pending, error: pendingErr } = await admin
    .from("matches")
    .select("id, kickoff_time, status")
    .neq("status", "finished")
    .lt("kickoff_time", cutoffIso);

  if (pendingErr) {
    return NextResponse.json({ ok: false, error: pendingErr.message }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ ok: true, scored: 0, recalculated: 0 });
  }

  let fixtures;
  try {
    fixtures = await fetchFixtures();
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch error";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
  const fixtureMap = new Map(fixtures.map((m) => [m.id, m]));

  let scored = 0;
  let recalculated = 0;

  for (const match of pending) {
    const fresh = fixtureMap.get(match.id);
    if (
      !fresh ||
      fresh.status !== "finished" ||
      fresh.home_score === null ||
      fresh.away_score === null
    ) {
      continue;
    }

    const realHome = fresh.home_score;
    const realAway = fresh.away_score;

    const { error: upErr } = await admin
      .from("matches")
      .update({
        home_score: realHome,
        away_score: realAway,
        status: "finished",
        scored_at: new Date().toISOString(),
      })
      .eq("id", match.id);
    if (upErr) continue;

    // Recalc todas las apuestas del partido.
    const { data: bets } = await admin
      .from("bets")
      .select("id, predicted_home_score, predicted_away_score")
      .eq("match_id", match.id);

    for (const b of bets ?? []) {
      const pts = calculatePoints(
        b.predicted_home_score,
        b.predicted_away_score,
        realHome,
        realAway,
      );
      const { error: betErr } = await admin
        .from("bets")
        .update({ points_earned: pts })
        .eq("id", b.id);
      if (!betErr) recalculated++;
    }
    scored++;
  }

  return NextResponse.json({ ok: true, scored, recalculated });
}
