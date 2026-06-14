import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RankingTable } from "@/components/RankingTable";
import { Podium } from "@/components/Podium";
import type { LeaderboardEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("leaderboard").select("*");
  if (error) throw new Error(error.message);

  const entries = (data ?? []) as LeaderboardEntry[];

  const { count: finishedCount } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("status", "finished");

  return (
    <div className="mx-auto max-w-screen-sm space-y-5 px-4 py-6">
      <header>
        <p className="kicker">Sala de control</p>
        <h1 className="mt-1 font-display text-4xl uppercase tracking-wide text-trophy-200">
          Ranking
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          La gloria familiar tras {finishedCount ?? 0} de 104 partidos.
        </p>
      </header>

      {entries.length >= 3 ? (
        <Podium top={entries.slice(0, 3)} />
      ) : entries.length > 0 ? (
        <p className="rounded-card border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-ink-muted">
          🥇 El podio aparece cuando hay al menos 3 familiares jugando.
        </p>
      ) : null}

      <RankingTable entries={entries} currentUserId={user!.id} />
    </div>
  );
}
