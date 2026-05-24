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
      <p className="rounded-xl bg-white p-4 text-sm text-carbon/60 shadow-sm">
        Aún nadie había apostado a este partido.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-carbon/5 overflow-hidden rounded-xl bg-white shadow-sm">
      {bets.map((b) => {
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
            className={`flex items-center justify-between gap-2 px-3 py-2 text-sm ${
              isMine ? "bg-trofeo/10" : ""
            }`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Avatar name={name} size="sm" />
              <span className="truncate font-medium">
                {name}
                {isMine && <span className="ml-1 text-[10px] font-normal text-cesped">(tú)</span>}
              </span>
            </span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-headline text-lg tabular-nums">
                {b.predicted_home_score}-{b.predicted_away_score}
              </span>
              {hasResult ? (
                <PointsBadge value={b.points_earned as 0 | 1 | 3} tone="compact" />
              ) : exactPending ? (
                <span className="rounded-full bg-trofeo/40 px-1.5 py-0 text-[10px] font-semibold text-carbon">
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
