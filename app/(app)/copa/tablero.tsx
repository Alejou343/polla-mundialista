"use client";

import { useMemo } from "react";
import { Flag } from "@/components/Flag";
import { teamDisplay } from "@/lib/teams";
import type { TeamStatus } from "@/lib/copa-bracket";
import type { Participant } from "./copa-view";

type Chip = { code: string; name: string; status: TeamStatus };

function aliveCount(p: Participant): number {
  return p.teams.filter((t) => t.status !== "eliminado").length;
}
function hasChampion(p: Participant): boolean {
  return p.teams.some((t) => t.status === "campeon");
}
function rank(p: Participant): number {
  return (hasChampion(p) ? 100 : 0) + aliveCount(p) * 10;
}

function TeamRow({ chip }: { chip: Chip }) {
  if (chip.status === "campeon") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="relative inline-flex">
          <Flag team={chip.name} size="sm" className="ring-2 ring-trophy-200" />
          <span className="absolute -right-1 -top-2 text-[11px]">👑</span>
        </span>
        <span className="font-headline text-[11px] uppercase tracking-wide text-trophy-200">
          {teamDisplay(chip.name)}
        </span>
      </span>
    );
  }
  if (chip.status === "eliminado") {
    return (
      <span className="inline-flex items-center gap-1.5" title="Eliminado">
        <Flag team={chip.name} size="sm" className="grayscale opacity-45" />
        <span className="font-headline text-[11px] uppercase tracking-wide text-ink-muted line-through decoration-ink-muted/60">
          {teamDisplay(chip.name)}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <Flag team={chip.name} size="sm" />
      <span className="font-headline text-[11px] uppercase tracking-wide text-ivory">
        {teamDisplay(chip.name)}
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-success-soft" aria-hidden />
    </span>
  );
}

function estadoLabel(p: Participant): { text: string; cls: string } {
  if (hasChampion(p)) return { text: "👑 Campeón", cls: "text-trophy-200" };
  const n = aliveCount(p);
  if (n === 2) return { text: "2 vivos", cls: "text-success-soft" };
  if (n === 1) return { text: "1 vivo", cls: "text-warning-soft" };
  return { text: "Sin chance", cls: "text-ink-muted" };
}

function ParticipantCard({ p }: { p: Participant }) {
  const estado = estadoLabel(p);
  const out = aliveCount(p) === 0 && !hasChampion(p);
  return (
    <div
      className={`rounded-card border p-3 transition ${
        hasChampion(p)
          ? "border-trophy-200/50 bg-trophy-200/[0.07] shadow-card"
          : p.isMe
            ? "border-trophy-200/30 bg-white/[0.05]"
            : out
              ? "border-white/5 bg-white/[0.02] opacity-60"
              : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 truncate font-headline text-sm uppercase tracking-wide text-ivory">
          {p.name}
          {p.isMe && (
            <span className="rounded-pill border border-trophy-200/40 bg-trophy-200/10 px-1.5 py-0.5 text-[9px] tracking-[0.18em] text-trophy-200">
              TÚ
            </span>
          )}
        </span>
        <span
          className={`shrink-0 font-headline text-[10px] uppercase tracking-[0.16em] ${estado.cls}`}
        >
          {estado.text}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {p.teams.map((t) => (
          <TeamRow key={t.code} chip={t} />
        ))}
      </div>
    </div>
  );
}

function ChampionBurst() {
  const emojis = ["🎉", "🏆", "🎊", "⭐", "🥳", "✨"];
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-[-40px] text-2xl"
          style={{
            left: `${(i * 53) % 100}%`,
            animation: `copa-fall ${2.4 + (i % 5) * 0.4}s linear ${(i % 7) * 0.25}s infinite`,
          }}
        >
          {emojis[i % emojis.length]}
        </span>
      ))}
      <style>{`
        @keyframes copa-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

export function Tablero({ participants, pot }: { participants: Participant[]; pot: number }) {
  const entries = useMemo(
    () => [...participants].sort((a, b) => rank(b) - rank(a) || a.name.localeCompare(b.name)),
    [participants],
  );

  const me = entries.find((p) => p.isMe);
  const champion = entries.find(hasChampion);
  const conChance = entries.filter((p) => aliveCount(p) > 0 || hasChampion(p)).length;

  return (
    <div className="space-y-5">
      {champion && (
        <section className="overflow-hidden rounded-card border border-trophy-200/50 bg-trophy-200/[0.1] p-5 text-center shadow-card">
          <p className="text-4xl" aria-hidden>
            🏆
          </p>
          <p className="mt-2 font-display text-3xl uppercase tracking-wide text-trophy-200">
            ¡Ganó {champion.name}!
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            con {teamDisplay(champion.teams.find((t) => t.status === "campeon")!.name)}, campeón del
            mundo 🌍
          </p>
        </section>
      )}

      {me && (
        <section>
          <h2 className="kicker mb-2">Tu pareja</h2>
          <div className="surface-card flex items-center justify-between gap-3 p-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {me.teams.map((t) => (
                <TeamRow key={t.code} chip={t} />
              ))}
            </div>
            <span
              className={`shrink-0 font-headline text-[10px] uppercase tracking-[0.16em] ${estadoLabel(me).cls}`}
            >
              {estadoLabel(me).text}
            </span>
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-display text-2xl uppercase tracking-wide text-trophy-200">
            Participantes
          </h2>
          <span className="font-headline text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            {champion ? "Terminado" : `${conChance} con chance`}
          </span>
        </div>
        <div className="space-y-2">
          {entries.map((p) => (
            <ParticipantCard key={p.userId} p={p} />
          ))}
        </div>
      </section>

      {champion && <ChampionBurst />}
    </div>
  );
}
