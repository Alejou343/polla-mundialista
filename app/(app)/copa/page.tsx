import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CopaView } from "./copa-view";
import { buildBracket, computeTeamStatuses, statusOf, type KMatch } from "@/lib/copa-bracket";

export const dynamic = "force-dynamic";

const KNOCKOUT = ["r32", "r16", "qf", "sf", "final", "third"];

export default async function CopaPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const { data: config } = await supabase
    .from("draft_config")
    .select("status, pot_amount")
    .eq("id", 1)
    .maybeSingle();

  const status = (config?.status ?? "pending") as "pending" | "drawn" | "closed";
  const pot = config?.pot_amount ?? 800000;

  if (status === "pending") {
    return (
      <CopaView data={{ status, pot, participants: [], myPair: [], myCodes: [], bracket: null }} />
    );
  }

  const [{ data: entries }, { data: profiles }, { data: matchesRaw }] = await Promise.all([
    supabase.from("draft_entries").select("user_id, team_code, team_name"),
    supabase.from("profiles").select("id, display_name"),
    supabase
      .from("matches")
      .select("match_number, home_team, away_team, home_team_code, away_team_code, winner_code")
      .in("stage", KNOCKOUT),
  ]);

  const matches = (matchesRaw ?? []) as KMatch[];
  const bracket = buildBracket(matches);
  const statuses = computeTeamStatuses(matches);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name.trim()]));

  const byUser = new Map<string, { code: string; name: string }[]>();
  for (const e of entries ?? []) {
    if (!byUser.has(e.user_id)) byUser.set(e.user_id, []);
    byUser.get(e.user_id)!.push({ code: e.team_code, name: e.team_name });
  }

  const participants = [...byUser.entries()].map(([uid, teams]) => ({
    userId: uid,
    name: nameById.get(uid) ?? "Familiar",
    isMe: uid === userId,
    teams: teams.map((t) => ({ code: t.code, name: t.name, status: statusOf(t.code, statuses) })),
  }));

  const myTeams = byUser.get(userId) ?? [];

  return (
    <CopaView
      data={{
        status,
        pot,
        participants,
        myPair: myTeams.map((t) => ({ name: t.name, code: t.code })),
        myCodes: myTeams.map((t) => t.code),
        bracket,
      }}
    />
  );
}
