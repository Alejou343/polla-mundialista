"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useTransition } from "react";
import { placeBetAction, deleteBetAction } from "./actions";
import type { Bet } from "@/lib/types";

const MIN = 0;
const MAX = 20;
const QUICK_PICKS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
  [2, 0],
  [0, 2],
  [2, 1],
  [1, 2],
  [2, 2],
  [3, 1],
];

function clamp(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(MAX, Math.max(MIN, n));
}

function SubmitBet({ existing }: { existing: Bet | null }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary flex-1">
      {pending ? "Guardando…" : existing ? "Actualizar apuesta" : "Guardar apuesta"}
    </button>
  );
}

function Stepper({
  value,
  onChange,
  label,
  name,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  name: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-carbon/60">
        {label}
      </span>
      <div className="mt-1 flex items-stretch overflow-hidden rounded-xl border border-carbon/15 bg-marfil">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          aria-label={`Restar 1 a ${label}`}
          className="flex h-16 w-12 items-center justify-center text-2xl text-carbon/70 transition hover:bg-carbon/5 active:bg-carbon/10"
        >
          −
        </button>
        <input
          type="number"
          name={name}
          value={value}
          onChange={(e) => onChange(clamp(parseInt(e.target.value, 10)))}
          min={MIN}
          max={MAX}
          inputMode="numeric"
          aria-label={`Marcador ${label}`}
          className="h-16 w-16 border-x border-carbon/10 bg-white text-center font-headline text-4xl tabular-nums text-carbon focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cesped/40"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          aria-label={`Sumar 1 a ${label}`}
          className="flex h-16 w-12 items-center justify-center text-2xl text-carbon/70 transition hover:bg-carbon/5 active:bg-carbon/10"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function BetForm({
  matchId,
  existing,
  homeTeamShort,
  awayTeamShort,
}: {
  matchId: string;
  existing: Bet | null;
  homeTeamShort: string;
  awayTeamShort: string;
}) {
  const [state, formAction] = useFormState(placeBetAction, null);
  const [isDeleting, startDelete] = useTransition();
  const [home, setHome] = useState<number>(existing?.predicted_home_score ?? 0);
  const [away, setAway] = useState<number>(existing?.predicted_away_score ?? 0);

  const dirty =
    !existing || existing.predicted_home_score !== home || existing.predicted_away_score !== away;

  function onDelete() {
    if (!existing) return;
    if (!confirm("¿Eliminar tu apuesta para este partido?")) return;
    startDelete(async () => {
      await deleteBetAction(matchId);
    });
  }

  return (
    <form action={formAction} className="rounded-xl bg-white p-4 shadow-sm">
      <input type="hidden" name="matchId" value={matchId} />

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <Stepper value={home} onChange={setHome} label={homeTeamShort} name="predictedHome" />
        <div className="pb-2 font-headline text-3xl text-carbon/30">–</div>
        <Stepper value={away} onChange={setAway} label={awayTeamShort} name="predictedAway" />
      </div>

      {/* Quick picks */}
      <div className="mt-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-carbon/55">
          Marcadores comunes
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {QUICK_PICKS.map(([h, a]) => {
            const isSelected = home === h && away === a;
            return (
              <li key={`${h}-${a}`}>
                <button
                  type="button"
                  onClick={() => {
                    setHome(h);
                    setAway(a);
                  }}
                  className={`rounded-full px-2.5 py-1 font-headline text-sm tabular-nums transition ${
                    isSelected ? "bg-cesped text-white" : "bg-marfil text-carbon hover:bg-cesped/10"
                  }`}
                >
                  {h}-{a}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {state?.ok && (
        <p className="mt-3 rounded-md bg-cesped/10 px-3 py-2 text-sm text-cesped">
          ✓ ¡Apuesta guardada!
        </p>
      )}
      {state && !state.ok && (
        <p className="mt-3 rounded-md bg-cancha/10 px-3 py-2 text-sm text-cancha">{state.error}</p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <SubmitBet existing={existing} />
        {existing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="btn-ghost text-cancha"
          >
            {isDeleting ? "Eliminando…" : "Borrar"}
          </button>
        )}
      </div>

      {existing && !dirty && (
        <p className="mt-2 text-center text-[11px] text-carbon/55">
          Tu apuesta actual ya está guardada. Cámbiala antes de que empiece el partido.
        </p>
      )}
    </form>
  );
}
