import Link from "next/link";
import { Countdown } from "./Countdown";

export function PendingBanner({
  pendingCount,
  nextDeadlineIso,
}: {
  pendingCount: number;
  nextDeadlineIso: string | null;
}) {
  if (pendingCount === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-card border border-trophy-200/30 bg-gradient-to-br from-trophy-200/10 via-stadium to-stadium p-4 shadow-trophy">
      <span aria-hidden className="absolute right-0 top-0 h-32 w-32 bg-trophy-halo" />
      <div className="relative flex items-start gap-3">
        <span className="mt-0.5 text-2xl" aria-hidden>
          ⚡
        </span>
        <div className="flex-1 text-sm">
          <p className="font-headline uppercase tracking-[0.1em] text-ivory">
            Te {pendingCount === 1 ? "falta" : "faltan"}{" "}
            <strong className="font-display text-xl tabular-nums text-trophy-200">
              {pendingCount}
            </strong>{" "}
            {pendingCount === 1 ? "apuesta" : "apuestas"} por hacer
          </p>
          {nextDeadlineIso && (
            <p className="mt-1 text-xs text-ink-soft">
              La próxima{" "}
              <Countdown
                isoTarget={nextDeadlineIso}
                prefix="cierra en "
                expiredText="acaba de cerrar"
                className="font-headline uppercase tracking-wide text-warning-soft"
              />
            </p>
          )}
        </div>
        <Link
          href="/matches?view=pending"
          className="self-center whitespace-nowrap rounded-pill bg-trophy-200 px-3 py-1.5 font-headline text-xs uppercase tracking-[0.14em] text-stadium shadow-trophy transition hover:bg-trophy-300"
        >
          Ver
        </Link>
      </div>
    </div>
  );
}
