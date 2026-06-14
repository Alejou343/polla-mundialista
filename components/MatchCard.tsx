import Link from "next/link";
import type { Bet, Match } from "@/lib/types";
import { teamDisplay } from "@/lib/teams";
import { stageLabel, timeShort } from "@/lib/format";
import { computeMatchState, liveMinutesElapsed, type MatchState } from "@/lib/match-state";
import { PointsBadge } from "@/components/PointsBadge";
import { Flag } from "@/components/Flag";
import { Countdown } from "@/components/Countdown";

function StateBadge({ state, match }: { state: MatchState; match: Match }) {
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
        En vivo · {min}&apos;
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

function CenterScore({ state, match }: { state: MatchState; match: Match }) {
  if (state === "finished") {
    return (
      <div className="text-center leading-none">
        <div className="font-display text-4xl tabular-nums text-ivory">
          {match.home_score ?? 0}
          <span className="mx-1 text-ink-muted/40">–</span>
          {match.away_score ?? 0}
        </div>
      </div>
    );
  }
  if (state === "live") {
    const hasScore = match.home_score !== null && match.away_score !== null;
    return (
      <div className="text-center leading-none">
        <div className="font-display text-4xl tabular-nums text-info-soft">
          {hasScore ? (
            <>
              {match.home_score}
              <span className="mx-1 text-ink-muted/40">–</span>
              {match.away_score}
            </>
          ) : (
            <>
              <span className="text-ink-muted/40">—</span>
              <span className="mx-1 text-ink-muted/40">–</span>
              <span className="text-ink-muted/40">—</span>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="text-center leading-none">
      <div className="font-display text-3xl text-trophy-200">VS</div>
      <div className="mt-1 font-headline text-[11px] uppercase tracking-[0.18em] tabular-nums text-ink-muted">
        {timeShort(match.kickoff_time)}
      </div>
    </div>
  );
}

function Footer({
  state,
  match,
  bet,
}: {
  state: MatchState;
  match: Match;
  bet: Bet | null | undefined;
}) {
  if (bet && bet.points_earned !== null) {
    return (
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <span className="text-ink-muted">
          Tu apuesta:{" "}
          <strong className="font-display text-base tabular-nums text-ivory">
            {bet.predicted_home_score}-{bet.predicted_away_score}
          </strong>
        </span>
        <PointsBadge value={bet.points_earned as 0 | 1 | 3} tone="compact" />
      </span>
    );
  }
  if (bet) {
    return (
      <span className="whitespace-nowrap text-ink-muted">
        Tu apuesta:{" "}
        <strong className="font-display text-base tabular-nums text-trophy-200">
          {bet.predicted_home_score}-{bet.predicted_away_score}
        </strong>
      </span>
    );
  }
  if (state === "closing-soon") {
    return (
      <Countdown
        isoTarget={match.kickoff_time}
        prefix="⚡ Apuesta antes — "
        expiredText="⏱ ¡Acaba de cerrar!"
        className="font-headline uppercase tracking-wide text-warning-soft"
      />
    );
  }
  if (state === "upcoming") {
    return (
      <span className="font-headline uppercase tracking-[0.14em] text-trophy-200">
        Aún no apuestas
      </span>
    );
  }
  if (state === "live") {
    return <span className="text-ink-muted">🔒 No alcanzaste a apostar</span>;
  }
  return <span className="text-ink-muted">Sin apuesta</span>;
}

export function MatchCard({ match, bet }: { match: Match; bet?: Bet | null }) {
  const state = computeMatchState(match);
  const userMissedIt = !bet && state !== "upcoming" && state !== "closing-soon";

  let wrapperCls =
    "group relative block overflow-hidden rounded-card border bg-white/[0.04] p-4 shadow-card backdrop-blur-sm transition hover:bg-white/[0.07] hover:shadow-cardHover";
  if (state === "live") {
    wrapperCls += " border-info/30 shadow-live";
  } else if (state === "closing-soon" && !bet) {
    wrapperCls += " border-warning/30";
  } else if (state === "finished") {
    wrapperCls += " border-white/5 opacity-80 hover:opacity-100";
  } else if (bet) {
    wrapperCls += " border-trophy-200/25";
  } else {
    wrapperCls += " border-white/10 hover:border-trophy-200/30";
  }

  return (
    <Link href={`/matches/${match.id}`} className={wrapperCls}>
      {/* Top glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      {/* Header: etapa + estado */}
      <div className="flex items-center justify-between gap-2">
        <span className="kicker truncate">{stageLabel(match.stage, match.group_name)}</span>
        <StateBadge state={state} match={match} />
      </div>

      {/* Equipos + score */}
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center text-center">
          <Flag team={match.home_team} size="lg" />
          <div className="mt-2 truncate font-headline text-sm uppercase tracking-wide text-ivory">
            {teamDisplay(match.home_team)}
          </div>
        </div>

        <CenterScore state={state} match={match} />

        <div className="flex flex-col items-center text-center">
          <Flag team={match.away_team} size="lg" />
          <div className="mt-2 truncate font-headline text-sm uppercase tracking-wide text-ivory">
            {teamDisplay(match.away_team)}
          </div>
        </div>
      </div>

      {/* Footer: sede + apuesta */}
      <div className="mt-4 flex items-center justify-between gap-2 text-xs text-ink-muted">
        <span className="truncate">📍 {match.venue ?? "Sede por confirmar"}</span>
        <Footer state={state} match={match} bet={bet} />
      </div>

      {userMissedIt && !bet && (
        <p className="mt-3 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-[11px] text-ink-muted">
          🔒 Ya empezó · no se puede apostar
        </p>
      )}
    </Link>
  );
}
