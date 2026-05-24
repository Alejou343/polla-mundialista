import Link from "next/link";
import type { Bet, Match } from "@/lib/types";
import { teamDisplay } from "@/lib/teams";
import { stageLabel, timeShort } from "@/lib/format";
import { computeMatchState, liveMinutesElapsed, type MatchState } from "@/lib/match-state";
import { PointsBadge } from "@/components/PointsBadge";
import { Flag } from "@/components/Flag";
import { Countdown } from "@/components/Countdown";

function StateBadge({ state, match }: { state: MatchState; match: Match }) {
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

function CenterScore({ state, match }: { state: MatchState; match: Match }) {
  if (state === "finished") {
    return (
      <div className="text-center leading-none">
        <div className="font-headline text-4xl tabular-nums">
          {match.home_score ?? 0}
          <span className="mx-1 text-carbon/30">–</span>
          {match.away_score ?? 0}
        </div>
      </div>
    );
  }
  if (state === "live") {
    const hasScore = match.home_score !== null && match.away_score !== null;
    return (
      <div className="text-center leading-none">
        <div className="font-headline text-4xl tabular-nums text-cancha">
          {hasScore ? (
            <>
              {match.home_score}
              <span className="mx-1 text-carbon/30">–</span>
              {match.away_score}
            </>
          ) : (
            <>
              <span className="text-carbon/40">—</span>
              <span className="mx-1 text-carbon/30">–</span>
              <span className="text-carbon/40">—</span>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="text-center leading-none">
      <div className="font-headline text-3xl text-carbon/40">VS</div>
      <div className="mt-1 text-xs text-carbon/60 tabular-nums">
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
  // Apuesta hecha + puntos calculados
  if (bet && bet.points_earned !== null) {
    return (
      <span className="flex items-center gap-1.5 whitespace-nowrap">
        <span>
          Tu apuesta:{" "}
          <strong className="text-carbon tabular-nums">
            {bet.predicted_home_score}-{bet.predicted_away_score}
          </strong>
        </span>
        <PointsBadge value={bet.points_earned as 0 | 1 | 3} tone="compact" />
      </span>
    );
  }
  // Apuesta hecha (no calculada todavía)
  if (bet) {
    return (
      <span className="whitespace-nowrap">
        Tu apuesta:{" "}
        <strong className="text-carbon tabular-nums">
          {bet.predicted_home_score}-{bet.predicted_away_score}
        </strong>
      </span>
    );
  }
  // Sin apuesta y cierra pronto
  if (state === "closing-soon") {
    return (
      <Countdown
        isoTarget={match.kickoff_time}
        prefix="⚡ Apuesta antes — "
        expiredText="⏱ ¡Acaba de cerrar!"
        className="font-semibold text-cancha"
      />
    );
  }
  // Sin apuesta, abierto pero no urgente
  if (state === "upcoming") {
    return <span className="text-cesped">⚡ Aún no apuestas</span>;
  }
  // Sin apuesta y ya cerrado o finished
  if (state === "live") {
    return <span className="text-carbon/50">🔒 No alcanzaste a apostar</span>;
  }
  return <span className="text-carbon/50">Sin apuesta</span>;
}

export function MatchCard({ match, bet }: { match: Match; bet?: Bet | null }) {
  const state = computeMatchState(match);
  const userMissedIt = !bet && state !== "upcoming" && state !== "closing-soon";

  // Estilo del wrapper según estado
  let wrapperCls = "block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow";
  if (state === "live") {
    wrapperCls += " border-cancha/40 ring-2 ring-cancha/20 hover:border-cancha/60";
  } else if (state === "closing-soon" && !bet) {
    wrapperCls += " border-cancha/30 ring-1 ring-cancha/20 hover:border-cancha/50";
  } else if (state === "finished") {
    wrapperCls += " border-carbon/5 opacity-90 hover:opacity-100";
  } else {
    wrapperCls += " border-carbon/5 hover:border-cesped/30";
  }

  return (
    <Link href={`/matches/${match.id}`} className={wrapperCls}>
      {/* Header: etapa + estado */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-carbon/55">
          {stageLabel(match.stage, match.group_name)}
        </span>
        <StateBadge state={state} match={match} />
      </div>

      {/* Equipos + score */}
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex flex-col items-center text-center">
          <Flag team={match.home_team} size="lg" />
          <div className="mt-2 truncate text-sm font-medium text-carbon">
            {teamDisplay(match.home_team)}
          </div>
        </div>

        <CenterScore state={state} match={match} />

        <div className="flex flex-col items-center text-center">
          <Flag team={match.away_team} size="lg" />
          <div className="mt-2 truncate text-sm font-medium text-carbon">
            {teamDisplay(match.away_team)}
          </div>
        </div>
      </div>

      {/* Footer: sede + apuesta */}
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-carbon/60">
        <span className="truncate">📍 {match.venue ?? "Sede por confirmar"}</span>
        <Footer state={state} match={match} bet={bet} />
      </div>

      {userMissedIt && !bet && (
        <p className="mt-2 rounded-md bg-carbon/5 px-2 py-1 text-[11px] text-carbon/60">
          🔒 Ya empezó · no se puede apostar
        </p>
      )}
    </Link>
  );
}
