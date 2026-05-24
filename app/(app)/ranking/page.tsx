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

  // Cuántos partidos ya están terminados (para el subtítulo).
  const { count: finishedCount } = await supabase
    .from("matches")
    .select("id", { count: "exact", head: true })
    .eq("status", "finished");

  return (
    <div className="mx-auto max-w-screen-sm px-4 py-6 space-y-5">
      <header>
        <h1 className="font-headline text-4xl uppercase tracking-wide">Ranking</h1>
        <p className="text-sm text-carbon/60">
          La gloria familiar tras {finishedCount ?? 0} de 104 partidos.
        </p>
      </header>

      {entries.length >= 1 && <Podium top={entries.slice(0, 3)} />}

      <RankingTable entries={entries} currentUserId={user!.id} />
    </div>
  );
}
