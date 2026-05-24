import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BetForm } from "./bet-form";
import { BetsList } from "@/components/BetsList";
import { PointsBadge } from "@/components/PointsBadge";
import { Flag } from "@/components/Flag";
import { Countdown } from "@/components/Countdown";
import { AutoRefreshOnExpire } from "@/components/AutoRefreshOnExpire";
import { teamCode, teamDisplay } from "@/lib/teams";
import { stageLabel, dateTimeFull, timeShort } from "@/lib/format";
import { computeMatchState, liveMinutesElapsed } from "@/lib/match-state";
import { calculatePoints } from "@/lib/scoring";
import type { Bet, Match } from "@/lib/types";

export const dynamic = "force-dynamic";

function HeaderBadge({ match }: { match: Match }) {
  const state = computeMatchState(match);
  if (state === "finished") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-carbon/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-carbon">
        ⚽ Final
      </span>
    );
  }
  if (state === "live") {
    const min = liveMinutesElapsed(match.kickoff_time);
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cancha/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cancha">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cancha" />
        En vivo · Min {min}
      </span>
    );
  }
  if (state === "closing-soon") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cancha/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cancha">
        ⏰ Cierra pronto
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cesped/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cesped">
      🟢 Programado
    </span>
  );
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

  const state = computeMatchState(match);
  const isOpen = state === "upcoming" || state === "closing-soon";
  const isFinished = state === "finished";
  const isLive = state === "live";
  const isLocked = !isOpen;

  // Apuestas ajenas — RLS las filtra. Antes de kickoff solo devuelve la propia.
  const { data: othersBetsData } = isLocked
    ? await supabase
        .from("bets")
        .select("*, profiles(display_name)")
        .eq("match_id", match.id)
        .order("points_earned", { ascending: false, nullsFirst: false })
    : { data: null };

  const otherBets = othersBetsData ?? [];

  const yourPoints =
    isFinished && myBet && match.home_score !== null && match.away_score !== null
      ? calculatePoints(
          myBet.predicted_home_score,
          myBet.predicted_away_score,
          match.home_score,
          match.away_score,
        )
      : null;

  const showScore = isLocked && match.home_score !== null && match.away_score !== null;

  return (
    <div className="mx-auto max-w-screen-sm px-4 py-6">
      {/* Auto-refresh la página justo después del kickoff para mostrar locked */}
      {isOpen && <AutoRefreshOnExpire isoTarget={match.kickoff_time} />}

      <Link
        href="/matches"
        className="inline-flex items-center gap-1 text-sm text-carbon/60 transition hover:text-cesped"
      >
        ← Volver
      </Link>

      {/* Hero card */}
      <header className="mt-3 rounded-xl border border-carbon/5 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-carbon/55">
            {stageLabel(match.stage, match.group_name)}
          </span>
          <HeaderBadge match={match} />
        </div>

        <p className="mt-3 text-center text-xs text-carbon/60">
          📍 {match.venue ?? "Sede por confirmar"}
        </p>
        <p className="text-center text-xs font-medium uppercase tracking-wider text-carbon/70">
          {dateTimeFull(match.kickoff_time)}{" "}
          <span className="font-normal normal-case text-carbon/50">(hora Colombia)</span>
        </p>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center text-center">
            <Flag team={match.home_team} size="xl" />
            <div className="mt-2 text-sm font-medium text-carbon">
              {teamDisplay(match.home_team)}
            </div>
          </div>

          <div className="text-center">
            {showScore ? (
              <div className="font-headline text-7xl leading-none tabular-nums">
                {match.home_score}
                <span className="mx-2 text-carbon/30">–</span>
                {match.away_score}
              </div>
            ) : isLive ? (
              <div className="font-headline text-7xl leading-none tabular-nums text-cancha">
                <span className="text-carbon/40">—</span>
                <span className="mx-2 text-carbon/30">–</span>
                <span className="text-carbon/40">—</span>
              </div>
            ) : (
              <div className="font-headline text-5xl leading-none text-carbon/40">VS</div>
            )}
            {isOpen && (
              <div className="mt-2 text-xs text-carbon/60 tabular-nums">
                {timeShort(match.kickoff_time)}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center text-center">
            <Flag team={match.away_team} size="xl" />
            <div className="mt-2 text-sm font-medium text-carbon">
              {teamDisplay(match.away_team)}
            </div>
          </div>
        </div>
      </header>

      {/* Tu apuesta */}
      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="font-headline text-xl uppercase tracking-wider">Tu apuesta</h2>
          {isOpen ? (
            <Countdown
              isoTarget={match.kickoff_time}
              prefix="Cierra en "
              expiredText="🔒 Acaba de cerrar"
              className={
                state === "closing-soon"
                  ? "text-xs font-semibold text-cancha"
                  : "text-xs text-carbon/55"
              }
            />
          ) : isLive ? (
            <span className="text-xs font-semibold text-cancha">🔒 Cerrada — partido en curso</span>
          ) : (
            <span className="text-xs text-carbon/55">Partido terminado</span>
          )}
        </div>

        {isOpen && (
          <BetForm
            matchId={match.id}
            existing={myBet}
            homeTeamShort={teamCode(match.home_team)}
            awayTeamShort={teamCode(match.away_team)}
          />
        )}

        {isLive && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            {myBet ? (
              <p className="text-sm">
                Tu predicción:{" "}
                <strong className="font-headline text-2xl tabular-nums">
                  {myBet.predicted_home_score}-{myBet.predicted_away_score}
                </strong>
              </p>
            ) : (
              <p className="text-sm text-carbon/60">No alcanzaste a apostar 😬</p>
            )}
            <p className="mt-1 text-xs text-cancha">
              🔒 Apuestas cerradas — ya empezó el partido. Esperá al final para ver los puntos.
            </p>
          </div>
        )}

        {isFinished && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            {myBet ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm">
                  Predijiste{" "}
                  <strong className="font-headline text-2xl tabular-nums">
                    {myBet.predicted_home_score}-{myBet.predicted_away_score}
                  </strong>
                </p>
                {yourPoints !== null && <PointsBadge value={yourPoints as 0 | 1 | 3} />}
              </div>
            ) : (
              <p className="text-sm text-carbon/60">No apostaste este partido.</p>
            )}
          </div>
        )}
      </section>

      {/* Apuestas de la familia */}
      {isLocked && (
        <section className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-headline text-xl uppercase tracking-wider">
              Apuestas de la familia
            </h2>
            <span className="text-xs text-carbon/55">
              {otherBets.length} {otherBets.length === 1 ? "apuesta" : "apuestas"}
            </span>
          </div>
          <BetsList
            bets={otherBets as never}
            realHome={match.home_score}
            realAway={match.away_score}
            currentUserId={userId}
          />
        </section>
      )}
    </div>
  );
}
