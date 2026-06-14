import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BetForm } from "./bet-form";
import { BetsList } from "@/components/BetsList";
import { PointsBadge } from "@/components/PointsBadge";
import { Flag } from "@/components/Flag";
import { Countdown } from "@/components/Countdown";
import { AutoRefreshOnExpire } from "@/components/AutoRefreshOnExpire";
import { ExactScoreCelebration } from "@/components/ExactScoreCelebration";
import { teamCode, teamDisplay } from "@/lib/teams";
import { stageLabel, dateTimeFull, timeShort } from "@/lib/format";
import { computeMatchState, liveMinutesElapsed } from "@/lib/match-state";
import { calculatePoints } from "@/lib/scoring";
import type { Bet, Match } from "@/lib/types";

export const dynamic = "force-dynamic";

function HeaderBadge({ match }: { match: Match }) {
  const state = computeMatchState(match);
  const base =
    "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 font-headline text-[10px] uppercase tracking-[0.18em]";
  if (state === "finished") {
    return <span className={`${base} border border-white/10 bg-white/5 text-ink-soft`}>Final</span>;
  }
  if (state === "live") {
    const min = liveMinutesElapsed(match.kickoff_time);
    return (
      <span className={`${base} border border-info/30 bg-info/15 text-info-soft shadow-live`}>
        <span className="live-dot" aria-hidden />
        En vivo · {min}'
      </span>
    );
  }
  if (state === "closing-soon") {
    return (
      <span className={`${base} border border-warning/30 bg-warning/15 text-warning-soft`}>
        Cierra pronto
      </span>
    );
  }
  return (
    <span className={`${base} border border-success/30 bg-success/15 text-success-soft`}>
      Programado
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
      {isOpen && <AutoRefreshOnExpire isoTarget={match.kickoff_time} />}

      <Link
        href="/matches"
        className="inline-flex items-center gap-1.5 font-headline text-xs uppercase tracking-[0.18em] text-ink-muted transition hover:text-trophy-200"
      >
        <ArrowLeft size={14} strokeWidth={2.4} aria-hidden /> Volver
      </Link>

      {/* Hero card con pitch-stripes */}
      <header className="relative mt-3 overflow-hidden rounded-card border border-white/10 shadow-card">
        <div
          aria-hidden
          className="absolute inset-0 bg-pitch-stripes opacity-40"
          style={{
            maskImage: "radial-gradient(ellipse at center, black 0%, black 50%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 0%, black 50%, transparent 90%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-stadium/60 via-stadium/40 to-stadium/90"
        />
        <div aria-hidden className="absolute inset-0 bg-stadium-spotlight" />

        <div className="relative p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="kicker truncate">{stageLabel(match.stage, match.group_name)}</span>
            <HeaderBadge match={match} />
          </div>

          <p className="mt-4 text-center text-[11px] text-ink-muted">
            📍 {match.venue ?? "Sede por confirmar"}
          </p>
          <p className="text-center font-headline text-xs uppercase tracking-[0.18em] text-ivory/80">
            {dateTimeFull(match.kickoff_time)}{" "}
            <span className="font-body normal-case tracking-normal text-ink-muted">
              (hora Colombia)
            </span>
          </p>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex flex-col items-center text-center">
              <Flag team={match.home_team} size="xl" />
              <div className="mt-2 font-headline text-sm uppercase tracking-wide text-ivory">
                {teamDisplay(match.home_team)}
              </div>
            </div>

            <div className="text-center">
              {showScore ? (
                <div className="font-display text-7xl leading-none tabular-nums text-trophy-200 drop-shadow-[0_2px_20px_rgba(250,204,21,0.35)]">
                  {match.home_score}
                  <span className="mx-2 text-ink-muted/40">–</span>
                  {match.away_score}
                </div>
              ) : isLive ? (
                <div className="font-display text-7xl leading-none tabular-nums text-info-soft">
                  <span className="text-ink-muted/40">—</span>
                  <span className="mx-2 text-ink-muted/40">–</span>
                  <span className="text-ink-muted/40">—</span>
                </div>
              ) : (
                <div className="font-display text-5xl leading-none text-trophy-200/80">VS</div>
              )}
              {isOpen && (
                <div className="mt-2 font-headline text-xs uppercase tracking-[0.18em] tabular-nums text-ink-muted">
                  {timeShort(match.kickoff_time)}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center text-center">
              <Flag team={match.away_team} size="xl" />
              <div className="mt-2 font-headline text-sm uppercase tracking-wide text-ivory">
                {teamDisplay(match.away_team)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tu apuesta */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl uppercase tracking-wide text-trophy-200">
            Tu apuesta
          </h2>
          {isOpen ? (
            <Countdown
              isoTarget={match.kickoff_time}
              prefix="Cierra en "
              expiredText="🔒 Acaba de cerrar"
              className={
                state === "closing-soon"
                  ? "font-headline text-xs uppercase tracking-[0.14em] text-warning-soft"
                  : "font-headline text-xs uppercase tracking-[0.14em] text-ink-muted"
              }
            />
          ) : isLive ? (
            <span className="font-headline text-xs uppercase tracking-[0.14em] text-info-soft">
              🔒 Cerrada — en curso
            </span>
          ) : (
            <span className="font-headline text-xs uppercase tracking-[0.14em] text-ink-muted">
              Partido terminado
            </span>
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
          <div className="surface-card p-4">
            {myBet ? (
              <p className="text-sm text-ink-soft">
                Tu predicción:{" "}
                <strong className="font-display text-3xl tabular-nums text-trophy-200">
                  {myBet.predicted_home_score}-{myBet.predicted_away_score}
                </strong>
              </p>
            ) : (
              <p className="text-sm text-ink-muted">No alcanzaste a apostar 😬</p>
            )}
            <p className="mt-1 text-xs text-info-soft">
              🔒 Apuestas cerradas — ya empezó el partido. Esperá al final para ver los puntos.
            </p>
          </div>
        )}

        {isFinished && (
          <div className="surface-card p-4">
            {myBet ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-ink-soft">
                  Predijiste{" "}
                  <strong className="font-display text-3xl tabular-nums text-ivory">
                    {myBet.predicted_home_score}-{myBet.predicted_away_score}
                  </strong>
                </p>
                {yourPoints !== null && <PointsBadge value={yourPoints as 0 | 1 | 3} />}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">No apostaste este partido.</p>
            )}
          </div>
        )}

        {isFinished && yourPoints === 3 && <ExactScoreCelebration matchId={match.id} />}
      </section>

      {/* Apuestas de la familia */}
      {isLocked && (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wide text-trophy-200">
              Apuestas de la familia
            </h2>
            <span className="font-headline text-xs uppercase tracking-[0.14em] text-ink-muted">
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
