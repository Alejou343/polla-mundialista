"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { placeBetAction, deleteBetAction } from "./actions";
import Loader from "@/components/Loader";
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
    <>
      <button type="submit" disabled={pending} className="btn-primary flex-1" aria-busy={pending}>
        {existing ? "Actualizar apuesta" : "Guardar apuesta"}
      </button>
      {pending && <Loader fullscreen size="lg" label="Guardando apuesta" />}
    </>
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
      <span className="font-headline text-[10px] uppercase tracking-[0.22em] text-ink-muted">
        {label}
      </span>
      <div className="mt-1.5 flex items-stretch overflow-hidden rounded-card border border-white/10 bg-white/[0.04]">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          aria-label={`Restar 1 a ${label}`}
          className="flex h-16 w-12 items-center justify-center text-ink-soft transition hover:bg-white/5 active:bg-white/10"
        >
          <Minus size={20} strokeWidth={2.4} />
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
          className="h-16 w-16 border-x border-white/10 bg-transparent text-center font-display text-4xl tabular-nums text-trophy-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-trophy-200/40"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          aria-label={`Sumar 1 a ${label}`}
          className="flex h-16 w-12 items-center justify-center text-ink-soft transition hover:bg-white/5 active:bg-white/10"
        >
          <Plus size={20} strokeWidth={2.4} />
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
    <form action={formAction} className="surface-card p-4">
      <input type="hidden" name="matchId" value={matchId} />

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <Stepper value={home} onChange={setHome} label={homeTeamShort} name="predictedHome" />
        <div className="pb-3 font-display text-3xl text-ink-muted/50">–</div>
        <Stepper value={away} onChange={setAway} label={awayTeamShort} name="predictedAway" />
      </div>

      <div className="mt-5">
        <p className="kicker mb-2">Marcadores comunes</p>
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
                  className={`rounded-pill px-3 py-1 font-display text-sm tabular-nums transition ${
                    isSelected
                      ? "bg-trophy-200 text-stadium shadow-trophy"
                      : "border border-white/10 bg-white/[0.04] text-ivory hover:bg-white/[0.08]"
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
        <p className="mt-4 rounded-card border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-soft">
          ✓ ¡Apuesta guardada!
        </p>
      )}
      {state && !state.ok && (
        <p className="mt-4 rounded-card border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-soft">
          {state.error}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2">
        <SubmitBet existing={existing} />
        {existing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="btn-danger"
            aria-label="Eliminar apuesta"
            aria-busy={isDeleting}
          >
            <Trash2 size={16} strokeWidth={2.2} aria-hidden />
            <span className="ml-1.5">Borrar</span>
          </button>
        )}
        {isDeleting && <Loader fullscreen size="lg" label="Eliminando apuesta" />}
      </div>

      {existing && !dirty && (
        <p className="mt-3 text-center font-headline text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          Tu apuesta actual ya está guardada. Cámbiala antes del kickoff.
        </p>
      )}
    </form>
  );
}
