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
    };
  });

  const { error } = await admin.from("matches").upsert(rows, { onConflict: "id" });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    total: fixtures.length,
    preserved: rows.filter((r) => r.status === "finished").length,
  });
}
