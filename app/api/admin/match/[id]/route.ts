import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { calculatePoints } from "@/lib/scoring";

const BodySchema = z.object({
  home_score: z.number().int().min(0).max(30),
  away_score: z.number().int().min(0).max(30),
});

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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Marcadores inválidos (0–30)." }, { status: 400 });
  }

  const adminClient = createAdminSupabaseClient();
  const realHome = parsed.data.home_score;
  const realAway = parsed.data.away_score;

  // Para eliminatorias con marcador decisivo en 90', fijamos también quién avanzó.
  // Si el admin marca empate (fue a penales) no se puede deducir aquí: se deja
  // el winner_code como esté y lo resuelve el sync de openfootball.
  const { data: meta } = await adminClient
    .from("matches")
    .select("stage, home_team_code, away_team_code")
    .eq("id", params.id)
    .single();

  const update: Record<string, unknown> = {
    home_score: realHome,
    away_score: realAway,
    status: "finished",
    scored_at: new Date().toISOString(),
  };
  if (meta && meta.stage !== "group" && realHome !== realAway) {
    update.winner_code = realHome > realAway ? meta.home_team_code : meta.away_team_code;
  }

  const { error: matchErr } = await adminClient.from("matches").update(update).eq("id", params.id);
  if (matchErr) {
    return NextResponse.json({ error: matchErr.message }, { status: 500 });
  }

  const { data: bets } = await adminClient
    .from("bets")
    .select("id, predicted_home_score, predicted_away_score")
    .eq("match_id", params.id);

  let recalculated = 0;
  for (const b of bets ?? []) {
    const pts = calculatePoints(b.predicted_home_score, b.predicted_away_score, realHome, realAway);
    const { error: betErr } = await adminClient
      .from("bets")
      .update({ points_earned: pts })
      .eq("id", b.id);
    if (!betErr) recalculated++;
  }

  return NextResponse.json({
    ok: true,
    matchId: params.id,
    betsRecalculated: recalculated,
  });
}
