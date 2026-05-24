import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BetForm } from "./bet-form";
import { BetsList } from "@/components/BetsList";
import { flag } from "@/components/MatchCard";
import { calculatePoints } from "@/lib/scoring";
import type { Bet, Match } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatLong(iso: string): string {
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: matchData, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !matchData) notFound();
  const match = matchData as Match;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const { data: myBetData } = await supabase
    .from("bets")
    .select("*")
    .eq("user_id", userId)
    .eq("match_id", match.id)
    .maybeSingle();
  const myBet = (myBetData ?? null) as Bet | null;

  const now = new Date();
  const kickoff = new Date(match.kickoff_time);
  const isLocked = kickoff <= now;
  const isFinished = match.status === "finished";

  // Apuestas ajenas: RLS las filtra; pedirlas siempre.
  // Si kickoff aún no llega, solo devolverá la propia.
  const { data: otherBetsData } = isLocked
    ? await supabase
        .from("bets")
        .select("*, profiles(display_name)")
        .eq("match_id", match.id)
        .order("points_earned", { ascending: false, nullsFirst: false })
    : { data: null };

  const otherBets = otherBetsData ?? [];

  const yourPoints =
    isFinished && myBet && match.home_score !== null && match.away_score !== null
      ? calculatePoints(
          myBet.predicted_home_score,
          myBet.predicted_away_score,
          match.home_score,
          match.away_score,
        )
      : null;

  return (
    <div className="mx-auto max-w-screen-sm px-4 py-6">
      <Link href="/matches" className="text-sm text-carbon/60 hover:text-cesped">
        ← Volver
      </Link>

      <header className="mt-3 rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs text-carbon/60">
          {match.group_name ? `Grupo ${match.group_name}` : "Eliminación"} ·{" "}
          {match.venue ?? "Sede por confirmar"}
        </p>
        <p className="text-xs text-carbon/60">{formatLong(match.kickoff_time)}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <span className="text-4xl">{flag(match.home_team_code)}</span>
            <span className="truncate text-lg font-medium">{match.home_team}</span>
          </div>
          <div className="px-3 text-center font-headline text-4xl tabular-nums">
            {isFinished && match.home_score !== null && match.away_score !== null ? (
              <span>
                {match.home_score} <span className="text-carbon/30">–</span> {match.away_score}
              </span>
            ) : (
              <span className="text-carbon/30">vs</span>
            )}
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
            <span className="truncate text-right text-lg font-medium">{match.away_team}</span>
            <span className="text-4xl">{flag(match.away_team_code)}</span>
          </div>
        </div>
      </header>

      <section className="mt-6">
        <h2 className="mb-2 font-headline text-xl uppercase tracking-wide">
          {isFinished ? "Tu apuesta" : isLocked ? "Apuestas cerradas" : "Tu apuesta"}
        </h2>
        {!isLocked && <BetForm matchId={match.id} existing={myBet} />}
        {isLocked && !isFinished && (
          <div className="rounded-xl bg-white p-4">
            {myBet ? (
              <p className="text-sm">
                Tu predicción:{" "}
                <strong className="font-headline text-xl">
                  {myBet.predicted_home_score}-{myBet.predicted_away_score}
                </strong>
              </p>
            ) : (
              <p className="text-sm text-carbon/60">No alcanzaste a apostar 😬.</p>
            )}
            <p className="mt-1 text-xs text-cielo">🔒 Apuestas cerradas — En juego o por jugar</p>
          </div>
        )}
        {isFinished && (
          <div className="rounded-xl bg-white p-4">
            {myBet ? (
              <p className="text-sm">
                Predijiste{" "}
                <strong className="font-headline text-xl">
                  {myBet.predicted_home_score}-{myBet.predicted_away_score}
                </strong>{" "}
                ·{" "}
                {yourPoints === 3 && (
                  <span className="rounded bg-trofeo/40 px-2 py-0.5 font-semibold text-carbon">
                    🏆 ¡Marcador exacto! +3
                  </span>
                )}
                {yourPoints === 1 && (
                  <span className="rounded bg-cesped/20 px-2 py-0.5 font-semibold text-cesped">
                    ✓ Acertaste el resultado +1
                  </span>
                )}
                {yourPoints === 0 && (
                  <span className="rounded bg-cancha/10 px-2 py-0.5 text-cancha">Sin puntos</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-carbon/60">No apostaste este partido.</p>
            )}
          </div>
        )}
      </section>

      {isLocked && (
        <section className="mt-8">
          <h2 className="mb-2 font-headline text-xl uppercase tracking-wide">
            Apuestas de la familia
          </h2>
          <BetsList
            bets={otherBets as any}
            realHome={match.home_score}
            realAway={match.away_score}
          />
        </section>
      )}
    </div>
  );
}
