import Link from "next/link";
import { Countdown } from "./Countdown";

/**
 * Banner sticky que muestra apuestas pendientes y cuándo cierra la próxima.
 * Solo se renderiza si pendingCount > 0.
 */
export function PendingBanner({
  pendingCount,
  nextDeadlineIso,
}: {
  pendingCount: number;
  nextDeadlineIso: string | null;
}) {
  if (pendingCount === 0) return null;

  return (
    <div className="rounded-xl border-2 border-cancha/30 bg-cancha/5 p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl" aria-hidden>
          ⚡
        </span>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-carbon">
            Te {pendingCount === 1 ? "falta" : "faltan"}{" "}
            <strong className="text-cancha tabular-nums">{pendingCount}</strong>{" "}
            {pendingCount === 1 ? "apuesta" : "apuestas"} por hacer
          </p>
          {nextDeadlineIso && (
            <p className="mt-0.5 text-xs text-carbon/70">
              La próxima{" "}
              <Countdown
                isoTarget={nextDeadlineIso}
                prefix="cierra en "
                expiredText="acaba de cerrar"
                className="font-semibold text-cancha"
              />
            </p>
          )}
        </div>
        <Link
          href="/matches?view=pending"
          className="self-center whitespace-nowrap rounded-md bg-cancha px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          Ver pendientes
        </Link>
      </div>
    </div>
  );
}
