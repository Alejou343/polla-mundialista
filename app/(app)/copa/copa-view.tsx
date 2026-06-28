"use client";

import { useState } from "react";
import { Tablero, type Scenario } from "./tablero";
import { Bracket } from "./bracket";
import { CopaGuideModal } from "./copa-guide-modal";

type Tab = "tablero" | "bracket";

// Estado del torneo (mock). En la app real sale de draft_config + matches.
// Cambia estas dos constantes para previsualizar otros estados durante el dev:
//   "pending" | "curso" | "final"  ·  completed: 0..5
const SCENARIO: Scenario = "curso";
const COMPLETED = 3;

export function CopaView() {
  const [tab, setTab] = useState<Tab>("tablero");

  return (
    <div className="mx-auto max-w-screen-sm space-y-4 px-4 py-6">
      <CopaGuideModal />

      <header>
        <p className="kicker">Juego paralelo</p>
        <h1 className="mt-1 font-display text-4xl uppercase tracking-wide text-trophy-200">
          Sorteo de campeón
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Cada quien apadrina 2 equipos al azar. Gana quien tenga al campeón del mundo.
        </p>
      </header>

      {/* Control segmentado: Tablero | Bracket */}
      <div
        role="tablist"
        aria-label="Vista del sorteo"
        className="flex gap-1 rounded-pill border border-white/10 bg-white/[0.03] p-1"
      >
        {(
          [
            { value: "tablero", label: "Tablero" },
            { value: "bracket", label: "Bracket" },
          ] as const
        ).map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`flex-1 rounded-pill px-3 py-2 font-headline text-xs uppercase tracking-[0.14em] transition ${
              tab === t.value
                ? "bg-trophy-200 text-stadium shadow-trophy"
                : "text-ink-muted hover:text-ivory"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tablero" ? <Tablero scenario={SCENARIO} /> : <Bracket completed={COMPLETED} />}
    </div>
  );
}
