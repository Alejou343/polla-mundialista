"use client";

import { useState } from "react";
import { Tablero } from "./tablero";
import { Bracket } from "./bracket";
import { CopaGuideModal } from "./copa-guide-modal";
import type { BracketData, TeamStatus } from "@/lib/copa-bracket";

export type Participant = {
  userId: string;
  name: string;
  isMe: boolean;
  teams: { code: string; name: string; status: TeamStatus }[];
};

export type CopaData = {
  status: "pending" | "drawn" | "closed";
  pot: number;
  participants: Participant[];
  myPair: { name: string; code: string }[];
  myCodes: string[];
  bracket: BracketData | null;
};

type Tab = "tablero" | "bracket";

export function CopaView({ data }: { data: CopaData }) {
  const [tab, setTab] = useState<Tab>("tablero");

  return (
    <div className="mx-auto max-w-screen-sm space-y-4 px-4 py-6">
      {data.status !== "pending" && data.myPair.length === 2 && (
        <CopaGuideModal pair={data.myPair} />
      )}

      <header>
        <p className="kicker">Juego paralelo</p>
        <h1 className="mt-1 font-display text-4xl uppercase tracking-wide text-trophy-200">
          Sorteo de campeón
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Cada quien apadrina 2 equipos al azar. Gana quien tenga al campeón del mundo.
        </p>
      </header>

      {data.status === "pending" ? (
        <section className="surface-card p-6 text-center">
          <p className="text-5xl" aria-hidden>
            🎲
          </p>
          <p className="mt-3 font-display text-2xl uppercase tracking-wide text-trophy-200">
            El sorteo aún no se ha corrido
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Cuando se sortee, cada quien recibe 2 equipos al azar. Gana quien tenga al campeón.
          </p>
          <p className="mt-3 font-headline text-xs uppercase tracking-[0.16em] text-ink-soft">
            16 participantes · pozo ${data.pot.toLocaleString("es-CO")}
          </p>
        </section>
      ) : (
        <>
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

          {tab === "tablero" ? (
            <Tablero participants={data.participants} pot={data.pot} />
          ) : data.bracket ? (
            <Bracket bracket={data.bracket} myCodes={data.myCodes} />
          ) : null}
        </>
      )}
    </div>
  );
}
