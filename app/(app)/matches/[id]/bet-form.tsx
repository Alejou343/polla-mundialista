"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTransition } from "react";
import { placeBetAction, deleteBetAction } from "./actions";
import type { Bet } from "@/lib/types";

function SubmitBet({ existing }: { existing: Bet | null }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary flex-1">
      {pending ? "Guardando…" : existing ? "Actualizar apuesta" : "Apostar"}
    </button>
  );
}

export function BetForm({ matchId, existing }: { matchId: string; existing: Bet | null }) {
  const [state, formAction] = useFormState(placeBetAction, null);
  const [isDeleting, startDelete] = useTransition();

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
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <label className="block">
          <input
            type="number"
            name="predictedHome"
            min={0}
            max={20}
            defaultValue={existing?.predicted_home_score ?? ""}
            required
            inputMode="numeric"
            aria-label="Marcador local"
            className="block w-full rounded-xl border border-carbon/15 bg-marfil py-6 text-center font-headline text-5xl tabular-nums text-carbon focus:border-cesped focus:outline-none focus:ring-2 focus:ring-cesped/30"
          />
        </label>
        <div className="font-headline text-4xl text-carbon/30">–</div>
        <label className="block">
          <input
            type="number"
            name="predictedAway"
            min={0}
            max={20}
            defaultValue={existing?.predicted_away_score ?? ""}
            required
            inputMode="numeric"
            aria-label="Marcador visitante"
            className="block w-full rounded-xl border border-carbon/15 bg-marfil py-6 text-center font-headline text-5xl tabular-nums text-carbon focus:border-cesped focus:outline-none focus:ring-2 focus:ring-cesped/30"
          />
        </label>
      </div>

      {state?.ok && (
        <p className="mt-3 rounded-md bg-cesped/10 px-3 py-2 text-sm text-cesped">
          ¡Apuesta guardada!
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
    </form>
  );
}
