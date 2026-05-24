import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RankingTable } from "@/components/RankingTable";
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

  return (
    <div className="mx-auto max-w-screen-sm px-4 py-6">
      <h1 className="font-headline text-4xl text-cesped">Ranking</h1>
      <p className="text-sm text-carbon/60">
        Se actualiza una vez al día tras procesar los resultados.
      </p>
      <div className="mt-6">
        <RankingTable entries={entries} currentUserId={user!.id} />
      </div>
    </div>
  );
}
