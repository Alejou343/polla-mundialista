import { NextResponse } from "next/server";
import { fetchFixtures } from "@/lib/openfootball";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

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

  let fixtures;
  try {
    fixtures = await fetchFixtures();
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch error";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  // Cargar existentes para preservar scores ya cerrados.
  const { data: existing, error: existingErr } = await admin
    .from("matches")
    .select("id, status, home_score, away_score");
  if (existingErr) {
    return NextResponse.json({ ok: false, error: existingErr.message }, { status: 500 });
  }
  const existingMap = new Map((existing ?? []).map((e) => [e.id, e]));

  const rows = fixtures.map((m) => {
    const prior = existingMap.get(m.id);
    const isLocked = prior?.status === "finished";
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
      status: isLocked ? "finished" : m.status,
      home_score: isLocked ? prior!.home_score : m.home_score,
      away_score: isLocked ? prior!.away_score : m.away_score,
      // Siempre desde el fixture fresco: así los penales que openfootball
      // publique tras marcar finished el partido se rellenan en el próximo sync.
      winner_code: m.winner_code,
    };
  });

  const { error } = await admin.from("matches").upsert(rows, { onConflict: "id" });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Reconciliación: openfootball resuelve placeholders de eliminatorias cambiando
  // los nombres de equipo, y como el id se deriva de ellos (makeId), cada cambio
  // crea una fila NUEVA y deja la vieja huérfana. Borramos las filas de eliminatorias
  // que ya no están en el JSON actual, salvo que estén finalizadas o tengan apuestas
  // (esas se preservan y se repuntan a mano si hiciera falta).
  const KNOCKOUT_STAGES = ["r32", "r16", "qf", "sf", "final", "third"];
  const fixtureIds = new Set(fixtures.map((f) => f.id));
  let reconciled = 0;

  const { data: knockoutRows } = await admin
    .from("matches")
    .select("id, status")
    .in("stage", KNOCKOUT_STAGES);

  const stale = (knockoutRows ?? []).filter(
    (r) => !fixtureIds.has(r.id) && r.status !== "finished",
  );

  if (stale.length > 0) {
    const staleIds = stale.map((r) => r.id);
    const { data: betsOnStale } = await admin
      .from("bets")
      .select("match_id")
      .in("match_id", staleIds);
    const betMatchIds = new Set((betsOnStale ?? []).map((b) => b.match_id));
    const toDelete = staleIds.filter((id) => !betMatchIds.has(id));

    if (toDelete.length > 0) {
      const { error: delErr } = await admin.from("matches").delete().in("id", toDelete);
      if (!delErr) reconciled = toDelete.length;
    }
  }

  return NextResponse.json({
    ok: true,
    total: fixtures.length,
    preserved: rows.filter((r) => r.status === "finished").length,
    reconciled,
  });
}
