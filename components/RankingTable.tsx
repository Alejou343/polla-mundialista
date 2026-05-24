import type { LeaderboardEntry } from "@/lib/types";

export function RankingTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId: string;
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-carbon/60">Aún no hay participantes.</p>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-carbon/10 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-cesped/5 text-left text-carbon/70">
          <tr>
            <th className="px-3 py-2 w-8">#</th>
            <th className="px-3 py-2">Familiar</th>
            <th className="px-3 py-2 text-right tabular-nums">Pts</th>
            <th className="px-3 py-2 text-right tabular-nums">🎯</th>
            <th className="px-3 py-2 text-right tabular-nums">✓</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const isMe = e.user_id === currentUserId;
            return (
              <tr
                key={e.user_id}
                className={`border-t border-carbon/5 ${isMe ? "bg-trofeo/10 font-medium" : ""}`}
              >
                <td className="px-3 py-2 text-carbon/60">{i + 1}</td>
                <td className="px-3 py-2 truncate">
                  {e.display_name}
                  {isMe && <span className="ml-1 text-xs text-cesped">(tú)</span>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold">
                  {e.total_points}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-carbon/70">
                  {e.exact_scores}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-carbon/70">
                  {e.correct_results}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-carbon/5 px-3 py-2 text-xs text-carbon/50">
        🎯 marcadores exactos · ✓ aciertos de resultado · empates sin orden definido
      </p>
    </div>
  );
}
