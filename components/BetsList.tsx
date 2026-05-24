import type { Bet, Profile } from "@/lib/types";

type BetWithProfile = Bet & { profiles: Pick<Profile, "display_name"> | null };

export function BetsList({
  bets,
  realHome,
  realAway,
}: {
  bets: BetWithProfile[];
  realHome: number | null;
  realAway: number | null;
}) {
  if (!bets.length) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-carbon/60">
        Aún nadie había apostado a este partido.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-carbon/5 rounded-lg bg-white">
      {bets.map((b) => {
        const exact =
          realHome !== null &&
          realAway !== null &&
          b.predicted_home_score === realHome &&
          b.predicted_away_score === realAway;
        return (
          <li key={b.id} className="flex items-center justify-between px-4 py-2 text-sm">
            <span className="truncate font-medium">{b.profiles?.display_name ?? "Familiar"}</span>
            <span className="flex items-center gap-2">
              <span className="font-headline text-lg tabular-nums">
                {b.predicted_home_score}-{b.predicted_away_score}
              </span>
              {b.points_earned !== null ? (
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                    b.points_earned === 3
                      ? "bg-trofeo/40 text-carbon"
                      : b.points_earned === 1
                        ? "bg-cesped/20 text-cesped"
                        : "bg-cancha/10 text-cancha"
                  }`}
                >
                  +{b.points_earned}
                </span>
              ) : (
                exact && (
                  <span className="rounded bg-trofeo/40 px-1.5 py-0.5 text-xs font-semibold text-carbon">
                    🏆
                  </span>
                )
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
