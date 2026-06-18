import type { LeaderboardEntry } from "@/lib/types";
import { Avatar } from "./Avatar";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function RankingTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="surface-card px-6 py-10 text-center">
        <p className="text-5xl" aria-hidden>
          🏆
        </p>
        <p className="mt-3 font-display text-2xl uppercase tracking-wide text-trophy-200">
          El ranking está vacío
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Cuando alguien apueste y los partidos terminen, acá verás los puntajes.
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-card border border-white/10 bg-white/[0.03] shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-stadium-200/80 backdrop-blur-md">
            <th className="w-8 px-3 py-2.5 text-left font-headline text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              #
            </th>
            <th className="px-3 py-2.5 text-left font-headline text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Familiar
            </th>
            <th className="px-3 py-2.5 text-right font-headline text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-muted">
              Pts
            </th>
            <th className="px-3 py-2.5 text-right font-headline text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-muted">
              🎯
            </th>
            <th className="px-3 py-2.5 text-right font-headline text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-muted">
              ✓
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const place = i + 1;
            const isMe = e.user_id === currentUserId;
            const topRow =
              place === 1
                ? "bg-medal-gold/[0.06]"
                : place === 2
                  ? "bg-medal-silver/[0.05]"
                  : place === 3
                    ? "bg-medal-bronze/[0.05]"
                    : "";
            return (
              <tr
                key={e.user_id}
                className={`border-t border-white/5 transition ${topRow} ${
                  isMe ? "ring-1 ring-inset ring-trophy-200/40" : ""
                }`}
              >
                <td className="px-3 py-2.5 font-display text-base tabular-nums text-ink-muted">
                  {place}
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <Avatar name={e.display_name} size="sm" />
                    <span className="flex items-center gap-1 truncate">
                      <span className="truncate font-headline uppercase tracking-wide text-ivory">
                        {e.display_name}
                      </span>
                      {MEDALS[place] && <span aria-hidden>{MEDALS[place]}</span>}
                      {isMe && (
                        <span className="text-[10px] font-headline uppercase tracking-[0.18em] text-trophy-200">
                          (tú)
                        </span>
                      )}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-display text-lg tabular-nums text-trophy-200">
                  {e.total_points}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">
                  {e.exact_scores}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">
                  {e.correct_results}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-white/5 bg-stadium-200/60 px-3 py-2 font-headline text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        🎯 marcadores exactos · ✓ aciertos · empates sin orden definido
      </p>
    </div>
  );
}
