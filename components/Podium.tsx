import type { LeaderboardEntry } from "@/lib/types";
import { Avatar } from "./Avatar";

type PodiumSlot = {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
  barClass: string;
  height: string;
  medal: string;
  glow: string;
};

export function Podium({ top }: { top: LeaderboardEntry[] }) {
  if (!top.length) return null;
  const [first, second, third] = top;

  const slots: (PodiumSlot | null)[] = [
    second
      ? {
          entry: second,
          place: 2 as const,
          barClass:
            "bg-gradient-to-b from-medal-silver/30 to-medal-silver/10 text-ivory border border-medal-silver/30",
          height: "h-20",
          medal: "🥈",
          glow: "shadow-[0_0_24px_-8px_rgba(203,213,225,0.4)]",
        }
      : null,
    first
      ? {
          entry: first,
          place: 1 as const,
          barClass:
            "bg-gradient-to-b from-trophy-200/30 to-trophy-200/10 text-trophy-200 border border-trophy-200/40",
          height: "h-28",
          medal: "🥇",
          glow: "shadow-trophyGlow",
        }
      : null,
    third
      ? {
          entry: third,
          place: 3 as const,
          barClass:
            "bg-gradient-to-b from-medal-bronze/30 to-medal-bronze/10 text-trophy-700 border border-medal-bronze/30",
          height: "h-14",
          medal: "🥉",
          glow: "shadow-[0_0_24px_-8px_rgba(205,127,50,0.5)]",
        }
      : null,
  ];

  return (
    <section className="relative overflow-hidden rounded-card border border-white/10 bg-white/[0.03] p-5 shadow-card">
      <span aria-hidden className="absolute inset-0 bg-stadium-spotlight" />
      <div className="relative">
        <p className="kicker text-center">Podio de la familia</p>
        <div className="mt-5 grid grid-cols-3 items-end gap-3">
          {slots.map((slot, i) => {
            if (!slot) return <div key={i} />;
            return (
              <div key={slot.entry.user_id} className="flex flex-col items-center">
                <div className={`rounded-full ${slot.glow}`}>
                  <Avatar name={slot.entry.display_name} size="md" />
                </div>
                <span aria-hidden className="mt-1 text-2xl">
                  {slot.medal}
                </span>
                <span className="mt-1 max-w-full truncate text-center font-headline text-xs uppercase tracking-wide text-ivory">
                  {slot.entry.display_name}
                </span>
                <span className="text-[11px] text-ink-muted">
                  <strong className="font-display text-lg text-trophy-200">
                    {slot.entry.total_points}
                  </strong>{" "}
                  pts
                </span>
                <div
                  className={`mt-2 flex w-full items-center justify-center rounded-t-lg font-display text-2xl tabular-nums ${slot.barClass} ${slot.height}`}
                >
                  {slot.place}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
