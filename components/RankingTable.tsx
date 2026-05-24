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
      <p className="rounded-xl bg-white p-4 text-sm text-carbon/60 shadow-sm">
        Aún no hay participantes.
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-carbon text-white">
          <tr>
            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-[11px] w-8">
              #
            </th>
            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-[11px]">
              Familiar
            </th>
            <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-[11px] tabular-nums">
              Pts
            </th>
            <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-[11px] tabular-nums">
              🎯
            </th>
            <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-[11px] tabular-nums">
              ✓
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const place = i + 1;
            const isMe = e.user_id === currentUserId;
            return (
              <tr
                key={e.user_id}
                className={`border-t border-carbon/5 transition ${isMe ? "bg-trofeo/15" : ""}`}
              >
                <td className="px-3 py-2 text-carbon/60 tabular-nums">{place}</td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    <Avatar name={e.display_name} size="sm" />
                    <span className="flex items-center gap-1 truncate">
                      <span className="truncate font-medium">{e.display_name}</span>
                      {MEDALS[place] && <span aria-hidden>{MEDALS[place]}</span>}
                      {isMe && <span className="text-[10px] font-normal text-cesped">(tú)</span>}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-headline text-base tabular-nums">
                  {e.total_points}
                </td>
                <td className="px-3 py-2 text-right text-carbon/70 tabular-nums">
                  {e.exact_scores}
                </td>
                <td className="px-3 py-2 text-right text-carbon/70 tabular-nums">
                  {e.correct_results}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-carbon/5 bg-marfil/50 px-3 py-2 text-[11px] text-carbon/55">
        🎯 marcadores exactos · ✓ aciertos · empates sin orden definido
      </p>
    </div>
  );
}
