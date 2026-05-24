import Link from "next/link";
import type { Match, Bet } from "@/lib/types";

function flag(code: string | null): string {
  if (!code || code.length !== 3) return "🏳️";
  const map: Record<string, string> = {
    MEX: "🇲🇽",
    USA: "🇺🇸",
    CAN: "🇨🇦",
    ARG: "🇦🇷",
    BRA: "🇧🇷",
    COL: "🇨🇴",
    VEN: "🇻🇪",
    URU: "🇺🇾",
    ESP: "🇪🇸",
    POR: "🇵🇹",
    FRA: "🇫🇷",
    GER: "🇩🇪",
    ITA: "🇮🇹",
    NED: "🇳🇱",
    BEL: "🇧🇪",
    ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    CRO: "🇭🇷",
    POL: "🇵🇱",
    MAR: "🇲🇦",
    JPN: "🇯🇵",
    KOR: "🇰🇷",
    AUS: "🇦🇺",
    SEN: "🇸🇳",
    ECU: "🇪🇨",
    SUI: "🇨🇭",
    DEN: "🇩🇰",
    SRB: "🇷🇸",
    GHA: "🇬🇭",
    CMR: "🇨🇲",
    CRC: "🇨🇷",
    TUN: "🇹🇳",
    KSA: "🇸🇦",
    IRN: "🇮🇷",
    QAT: "🇶🇦",
    WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  };
  return map[code.toUpperCase()] ?? "🏳️";
}

function statusBadge(match: Match): { icon: string; label: string; cls: string } {
  const kickoff = new Date(match.kickoff_time);
  const now = new Date();
  if (match.status === "finished") {
    return { icon: "⚽", label: "Terminado", cls: "bg-carbon/10 text-carbon" };
  }
  if (kickoff > now) {
    return { icon: "🟢", label: "Programado", cls: "bg-cesped/10 text-cesped" };
  }
  return { icon: "🔒", label: "En juego", cls: "bg-cielo/10 text-cielo" };
}

function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MatchCard({ match, bet }: { match: Match; bet?: Bet | null }) {
  const badge = statusBadge(match);
  const showFinal =
    match.status === "finished" && match.home_score !== null && match.away_score !== null;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-xl border border-carbon/10 bg-white p-4 shadow-sm transition hover:border-cesped/40 hover:shadow"
    >
      <div className="flex items-center justify-between text-xs text-carbon/60">
        <span>
          {match.group_name ? `Grupo ${match.group_name}` : "Eliminación"} ·{" "}
          {match.venue ?? "Sede por confirmar"}
        </span>
        <span>{timeLabel(match.kickoff_time)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="text-2xl">{flag(match.home_team_code)}</span>
          <span className="truncate font-medium">{match.home_team}</span>
        </div>
        <div className="px-2 text-center font-headline text-2xl tabular-nums">
          {showFinal ? (
            <span>
              {match.home_score} <span className="text-carbon/40">–</span> {match.away_score}
            </span>
          ) : (
            <span className="text-carbon/30">vs</span>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
          <span className="truncate text-right font-medium">{match.away_team}</span>
          <span className="text-2xl">{flag(match.away_team_code)}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
          {badge.icon} {badge.label}
        </span>
        {bet ? (
          <span className="text-xs text-carbon/60">
            Tu apuesta:{" "}
            <strong className="text-carbon">
              {bet.predicted_home_score}-{bet.predicted_away_score}
            </strong>
            {bet.points_earned !== null && (
              <span
                className={`ml-2 rounded px-1.5 py-0.5 font-semibold ${
                  bet.points_earned === 3
                    ? "bg-trofeo/30 text-carbon"
                    : bet.points_earned === 1
                      ? "bg-cesped/20 text-cesped"
                      : "bg-cancha/10 text-cancha"
                }`}
              >
                +{bet.points_earned} pt{bet.points_earned === 1 ? "" : "s"}
              </span>
            )}
          </span>
        ) : (
          new Date(match.kickoff_time) > new Date() && (
            <span className="text-xs text-cesped">⚡ Aún no apuestas</span>
          )
        )}
      </div>
    </Link>
  );
}

export { flag };
