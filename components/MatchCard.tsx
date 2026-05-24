import Link from "next/link";
import type { Bet, Match } from "@/lib/types";
import { teamDisplay } from "@/lib/teams";
import { stageLabel, timeShort } from "@/lib/format";
import { PointsBadge } from "@/components/PointsBadge";
import { Flag } from "@/components/Flag";

function StatusBadge({ match }: { match: Match }) {
  const kickoff = new Date(match.kickoff_time);
  const now = new Date();
  if (match.status === "finished") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-carbon/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-carbon">
        ⚽ Final
      </span>
    );
  }
  if (kickoff > now) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cesped/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cesped">
        🟢 Programado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cielo/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cielo">
      🔴 En juego
    </span>
  );
}

function CenterScore({ match }: { match: Match }) {
  const kickoff = new Date(match.kickoff_time);
  const now = new Date();
  const isFinished = match.status === "finished";
  const isLive =
    !isFinished && kickoff <= now && match.home_score !== null && match.away_score !== null;
  if (isFinished || isLive) {
    return (
      <div className="text-center leading-none">
        <div className="font-headline text-4xl tabular-nums">
          {match.home_score ?? 0}
          <span className="mx-1 text-carbon/30">–</span>
          {match.away_score ?? 0}
        </div>
        {!isFinished && (
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-cancha">
            • En vivo
          </div>
        )}
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

export function MatchCard({ match, bet }: { match: Match; bet?: Bet | null }) {
  const kickoff = new Date(match.kickoff_time);
  const now = new Date();
  const isOpen = kickoff > now;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-xl border border-carbon/5 bg-white p-4 shadow-sm transition hover:border-cesped/30 hover:shadow"
    >
      {/* Header: etapa/grupo + estado */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-carbon/55">
          {stageLabel(match.stage, match.group_name)}
        </span>
        <StatusBadge match={match} />
      </div>

      {/* Equipos + score */}
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex flex-col items-center text-center">
          <Flag team={match.home_team} size="lg" />
          <div className="mt-2 truncate text-sm font-medium text-carbon">
            {teamDisplay(match.home_team)}
          </div>
        </div>

        <CenterScore match={match} />

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
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          {bet ? (
            <>
              <span>
                Tu apuesta:{" "}
                <strong className="text-carbon tabular-nums">
                  {bet.predicted_home_score}-{bet.predicted_away_score}
                </strong>
              </span>
              {bet.points_earned !== null && (
                <PointsBadge value={bet.points_earned as 0 | 1 | 3} tone="compact" />
              )}
            </>
          ) : isOpen ? (
            <span className="text-cesped">⚡ Aún no apuestas</span>
          ) : null}
        </span>
      </div>
    </Link>
  );
}
