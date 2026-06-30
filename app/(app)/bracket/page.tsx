import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Bracket } from "@/components/Bracket";
import { buildBracket, type KMatch } from "@/lib/copa-bracket";

export const dynamic = "force-dynamic";

// Visualización de la fase final (sin apuestas ni sorteo): el cuadro de
// eliminatorias que se va llenando solo a medida que se juegan los partidos.
const KNOCKOUT = ["r32", "r16", "qf", "sf", "final", "third"];

export default async function BracketPage() {
  const supabase = createServerSupabaseClient();

  const { data: matchesRaw } = await supabase
    .from("matches")
    .select("match_number, home_team, away_team, home_team_code, away_team_code, winner_code")
    .in("stage", KNOCKOUT);

  const bracket = buildBracket((matchesRaw ?? []) as KMatch[]);

  return (
    <div className="mx-auto max-w-screen-sm space-y-4 px-4 py-6">
      <header>
        <p className="kicker">Mundial 2026</p>
        <h1 className="mt-1 font-display text-4xl uppercase tracking-wide text-trophy-200">
          Fase final
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          El camino a la copa. Se actualiza con cada partido de eliminatorias.
        </p>
      </header>

      <Bracket bracket={bracket} />
    </div>
  );
}
