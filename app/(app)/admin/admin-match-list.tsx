"use client";

import { useMemo, useState } from "react";
import { AdminMatchRow } from "./admin-match-row";
import { teamDisplay } from "@/lib/teams";
import type { Match } from "@/lib/types";

type Bins = {
  pending: Match[];
  scored: Match[];
  future: Match[];
};

function computeBins(matches: Match[], now: number): Bins {
  const pending: Match[] = [];
  const scored: Match[] = [];
  const future: Match[] = [];
  for (const m of matches) {
    const kickoff = new Date(m.kickoff_time).getTime();
    const isFinished = m.status === "finished";
    const hasScore = m.home_score !== null && m.away_score !== null;
    if (kickoff > now) future.push(m);
    else if (isFinished && hasScore) scored.push(m);
    else pending.push(m);
  }
  const byKickoffDesc = (a: Match, b: Match) =>
    new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime();
  const byKickoffAsc = (a: Match, b: Match) =>
    new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime();
  pending.sort(byKickoffDesc);
  scored.sort(byKickoffDesc);
  future.sort(byKickoffAsc);
  return { pending, scored, future };
}

function matchMatchesSearch(m: Match, q: string): boolean {
  if (!q) return true;
  const haystack = [
    teamDisplay(m.home_team),
    teamDisplay(m.away_team),
    m.home_team,
    m.away_team,
    m.group_name ?? "",
    m.venue ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function AdminMatchList({ matches }: { matches: Match[] }) {
  const [search, setSearch] = useState("");
  // El "ahora" se fija en el mount para no rebucketear en cada render.
  const [pageLoadedAt] = useState<number>(() => Date.now());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter((m) => matchMatchesSearch(m, q));
  }, [matches, search]);

  const bins = useMemo(() => computeBins(filtered, pageLoadedAt), [filtered, pageLoadedAt]);

  const totalShown = bins.pending.length + bins.scored.length + bins.future.length;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar equipo, grupo o sede…"
          className="w-full rounded-lg border border-carbon/15 bg-white px-3 py-2 pl-9 text-sm focus:border-cesped focus:outline-none focus:ring-2 focus:ring-cesped/30"
          aria-label="Buscar partido"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-carbon/40"
        >
          🔎
        </span>
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-xs text-carbon/60 hover:bg-carbon/5"
          >
            ✕
          </button>
        )}
      </div>

      {totalShown === 0 && (
        <div className="rounded-xl bg-white px-6 py-10 text-center shadow-sm">
          <p className="text-5xl" aria-hidden>
            🔎
          </p>
          <p className="mt-3 font-headline text-2xl uppercase tracking-wide text-carbon">
            Sin resultados
          </p>
          <p className="mt-1 text-sm text-carbon/60">
            No encontramos partidos con &ldquo;{search}&rdquo;.
          </p>
        </div>
      )}

      {/* ⏰ Por puntuar */}
      {bins.pending.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-2 font-headline text-lg uppercase tracking-wider text-cancha">
            ⏰ Por puntuar
            <span className="rounded-full bg-cancha/15 px-2 py-0.5 text-[11px] font-semibold text-cancha">
              {bins.pending.length}
            </span>
          </h3>
          <p className="mb-2 text-xs text-carbon/55">
            Partidos que ya jugaron pero aún no tienen marcador cargado.
          </p>
          <div className="space-y-2">
            {bins.pending.map((m) => (
              <AdminMatchRow key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* ✅ Ya puntuados — colapsable */}
      {bins.scored.length > 0 && (
        <details className="group rounded-xl bg-white p-4 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-base uppercase tracking-wide text-carbon">
            <span className="flex items-center gap-2">
              ✅ Ya puntuados
              <span className="rounded-full bg-carbon/10 px-2 py-0.5 text-[11px] font-semibold text-carbon">
                {bins.scored.length}
              </span>
            </span>
            <span className="text-xs text-carbon/50 transition group-open:rotate-180">▾</span>
          </summary>
          <p className="mt-2 text-xs text-carbon/55">
            Ya tienen marcador cargado. Podés corregir si te equivocaste.
          </p>
          <div className="mt-3 space-y-2">
            {bins.scored.map((m) => (
              <AdminMatchRow key={m.id} match={m} />
            ))}
          </div>
        </details>
      )}

      {/* 📅 Por jugar — colapsable */}
      {bins.future.length > 0 && (
        <details className="group rounded-xl bg-white p-4 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-base uppercase tracking-wide text-carbon">
            <span className="flex items-center gap-2">
              📅 Por jugar
              <span className="rounded-full bg-carbon/10 px-2 py-0.5 text-[11px] font-semibold text-carbon">
                {bins.future.length}
              </span>
            </span>
            <span className="text-xs text-carbon/50 transition group-open:rotate-180">▾</span>
          </summary>
          <p className="mt-2 text-xs text-carbon/55">
            Faltan por jugar. Podés precargar un resultado si lo necesitás, pero normalmente no hace
            falta.
          </p>
          <div className="mt-3 space-y-2">
            {bins.future.map((m) => (
              <AdminMatchRow key={m.id} match={m} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
