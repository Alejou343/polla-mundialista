import { tournamentDayLong } from "@/lib/format";

export function DateGroupHeader({ isoDate }: { isoDate: string }) {
  return (
    <div className="mb-3 mt-7 flex items-baseline gap-3">
      <span aria-hidden className="h-px flex-1 bg-trophy-200/20" />
      <h2 className="font-display text-2xl uppercase tracking-[0.06em] text-trophy-200">
        {tournamentDayLong(isoDate)}
      </h2>
      <span aria-hidden className="h-px flex-1 bg-trophy-200/20" />
    </div>
  );
}
