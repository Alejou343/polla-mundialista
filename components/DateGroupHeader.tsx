import { tournamentDayLong } from "@/lib/format";

export function DateGroupHeader({ isoDate }: { isoDate: string }) {
  return (
    <h2 className="mt-6 mb-2 font-headline text-2xl uppercase tracking-wide text-carbon/80">
      {tournamentDayLong(isoDate)}
    </h2>
  );
}
