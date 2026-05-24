import type { LeaderboardEntry } from "@/lib/types";
import { Avatar } from "./Avatar";

type PodiumSlot = {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
  barClass: string;
  height: string;
  medal: string;
};

export function Podium({ top }: { top: LeaderboardEntry[] }) {
  if (!top.length) return null;
  const [first, second, third] = top;

  const slots: (PodiumSlot | null)[] = [
    second
      ? {
          entry: second,
          place: 2 as const,
          barClass: "bg-carbon/15 text-carbon",
          height: "h-16",
          medal: "🥈",
        }
      : null,
    first
      ? {
          entry: first,
          place: 1 as const,
          barClass: "bg-trofeo text-carbon",
          height: "h-24",
          medal: "🥇",
        }
      : null,
    third
      ? {
          entry: third,
          place: 3 as const,
          barClass: "bg-[#c98a4a] text-white",
          height: "h-12",
          medal: "🥉",
        }
      : null,
  ];

  return (
    <section className="rounded-xl bg-marfil/60 p-4 ring-1 ring-carbon/5">
      <h2 className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-carbon/70">
        Podio de la familia
      </h2>
      <div className="grid grid-cols-3 items-end gap-3">
        {slots.map((slot, i) => {
          if (!slot) return <div key={i} />;
          return (
            <div key={slot.entry.user_id} className="flex flex-col items-center">
              <Avatar name={slot.entry.display_name} size="md" />
              <span aria-hidden className="mt-1 text-lg">
                {slot.medal}
              </span>
              <span className="mt-1 max-w-full truncate text-center text-xs font-medium">
                {slot.entry.display_name}
              </span>
              <span className="text-[11px] text-carbon/60">
                <strong className="font-headline text-base text-carbon">
                  {slot.entry.total_points}
                </strong>{" "}
                pts
              </span>
              <div
                className={`mt-2 flex w-full items-center justify-center rounded-t-lg font-headline text-2xl tabular-nums ${slot.barClass} ${slot.height}`}
              >
                {slot.place}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
