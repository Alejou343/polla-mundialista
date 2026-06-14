import type { Bet, Profile } from "@/lib/types";
import { Avatar } from "./Avatar";
import { PointsBadge } from "./PointsBadge";

type BetWithProfile = Bet & {
  profiles: Pick<Profile, "display_name"> | null;
};

export function BetsList({
  bets,
  realHome,
  realAway,
  currentUserId,
}: {
  bets: BetWithProfile[];
  realHome: number | null;
  realAway: number | null;
  currentUserId: string;
}) {
  if (!bets.length) {
    return (
      <div className="surface-card px-6 py-10 text-center">
        <p className="text-5xl" aria-hidden>
          😶
        </p>
        <p className="mt-3 font-display text-2xl uppercase tracking-wide text-trophy-200">
          Nadie apostó este partido
        </p>
        <p className="mt-1 text-sm text-ink-muted">La familia se quedó sin apostar. ¡La próxima!</p>
      </div>
    );
  }
  return (
    <ul className="overflow-hidden rounded-card border border-white/10 bg-white/[0.03] shadow-card">
      {bets.map((b, i) => {
        const isMine = b.user_id === currentUserId;
        const name = b.profiles?.display_name ?? "Familiar";
        const hasResult = realHome !== null && realAway !== null && b.points_earned !== null;
        const exactPending =
          !hasResult &&
          realHome !== null &&
          realAway !== null &&
          b.predicted_home_score === realHome &&
          b.predicted_away_score === realAway;
        return (
          <li
            key={b.id}
            className={`flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition ${
              i > 0 ? "border-t border-white/5" : ""
            } ${isMine ? "bg-trophy-200/10" : ""}`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Avatar name={name} size="sm" />
              <span className="truncate font-headline uppercase tracking-wide text-ivory">
                {name}
                {isMine && (
                  <span className="ml-1 font-body text-[10px] uppercase tracking-[0.18em] text-trophy-200">
                    (tú)
                  </span>
                )}
              </span>
            </span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-display text-lg tabular-nums text-ivory">
                {b.predicted_home_score}-{b.predicted_away_score}
              </span>
              {hasResult ? (
                <PointsBadge value={b.points_earned as 0 | 1 | 3} tone="compact" />
              ) : exactPending ? (
                <span className="rounded-pill border border-trophy-200/40 bg-trophy-200/20 px-1.5 py-0 text-[10px] font-semibold text-trophy-200">
                  🏆
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
