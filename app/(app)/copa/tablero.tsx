"use client";

import { useMemo } from "react";
import { Flag } from "@/components/Flag";
import { teamDisplay } from "@/lib/teams";

// ── Tipos (espejan la futura vista draft_team_status) ────────────────────────
type TeamStatus = "vivo" | "eliminado" | "campeon";
type TeamChip = { team: string; status: TeamStatus; outRound?: string };
type Entry = { participant: string; teams: [TeamChip, TeamChip]; isMe?: boolean };
export type Scenario = "pending" | "curso" | "final";

const POT = 800_000;

// ── Dataset mock: torneo "en curso" ──────────────────────────────────────────
const BASE: Entry[] = [
  {
    participant: "Sofía",
    teams: [
      { team: "Brazil", status: "vivo" },
      { team: "Argentina", status: "vivo" },
    ],
  },
  {
    participant: "Alejo",
    isMe: true,
    teams: [
      { team: "Spain", status: "vivo" },
      { team: "Italy", status: "eliminado", outRound: "Octavos" },
    ],
  },
  {
    participant: "Andrés",
    teams: [
      { team: "France", status: "vivo" },
      { team: "Portugal", status: "vivo" },
    ],
  },
  {
    participant: "Olga",
    teams: [
      { team: "Germany", status: "vivo" },
      { team: "Denmark", status: "vivo" },
    ],
  },
  {
    participant: "Valentina",
    teams: [
      { team: "Mexico", status: "vivo" },
      { team: "USA", status: "vivo" },
    ],
  },
  {
    participant: "Mamá",
    teams: [
      { team: "Belgium", status: "vivo" },
      { team: "Serbia", status: "eliminado", outRound: "Dieciseisavos" },
    ],
  },
  {
    participant: "Papá",
    teams: [
      { team: "Netherlands", status: "vivo" },
      { team: "Australia", status: "eliminado", outRound: "Dieciseisavos" },
    ],
  },
  {
    participant: "Jaime",
    teams: [
      { team: "England", status: "vivo" },
      { team: "Ecuador", status: "eliminado", outRound: "Octavos" },
    ],
  },
  {
    participant: "Juan Carlos",
    teams: [
      { team: "Croatia", status: "vivo" },
      { team: "Switzerland", status: "eliminado", outRound: "Dieciseisavos" },
    ],
  },
  {
    participant: "Lucía",
    teams: [
      { team: "Uruguay", status: "vivo" },
      { team: "Japan", status: "eliminado", outRound: "Octavos" },
    ],
  },
  {
    participant: "Camilo",
    teams: [
      { team: "Colombia", status: "vivo" },
      { team: "Norway", status: "eliminado", outRound: "Dieciseisavos" },
    ],
  },
  {
    participant: "Paula",
    teams: [
      { team: "Senegal", status: "vivo" },
      { team: "Ghana", status: "eliminado", outRound: "Dieciseisavos" },
    ],
  },
  {
    participant: "Andrea",
    teams: [
      { team: "Austria", status: "vivo" },
      { team: "Canada", status: "eliminado", outRound: "Dieciseisavos" },
    ],
  },
  {
    participant: "Daniel",
    teams: [
      { team: "Morocco", status: "eliminado", outRound: "Octavos" },
      { team: "Nigeria", status: "eliminado", outRound: "Dieciseisavos" },
    ],
  },
  {
    participant: "Felipe",
    teams: [
      { team: "Egypt", status: "eliminado", outRound: "Dieciseisavos" },
      { team: "Poland", status: "eliminado", outRound: "Dieciseisavos" },
    ],
  },
  {
    participant: "Mariana",
    teams: [
      { team: "Korea Republic", status: "eliminado", outRound: "Dieciseisavos" },
      { team: "Qatar", status: "eliminado", outRound: "Dieciseisavos" },
    ],
  },
];

function toFinal(entries: Entry[]): Entry[] {
  return entries.map((e) => {
    if (e.participant === "Sofía") {
      return {
        ...e,
        teams: [
          { team: "Brazil", status: "campeon" },
          { team: "Argentina", status: "eliminado", outRound: "Semifinal" },
        ],
      };
    }
    return {
      ...e,
      teams: e.teams.map((t) => ({
        ...t,
        status: "eliminado" as const,
        outRound: t.outRound ?? (e.participant === "Andrés" ? "Final" : "Cuartos"),
      })) as [TeamChip, TeamChip],
    };
  });
}

function aliveCount(e: Entry): number {
  return e.teams.filter((t) => t.status !== "eliminado").length;
}
function hasChampion(e: Entry): boolean {
  return e.teams.some((t) => t.status === "campeon");
}
function rank(e: Entry): number {
  return (hasChampion(e) ? 100 : 0) + aliveCount(e) * 10;
}

function TeamRow({ chip }: { chip: TeamChip }) {
  if (chip.status === "campeon") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="relative inline-flex">
          <Flag team={chip.team} size="sm" className="ring-2 ring-trophy-200" />
          <span className="absolute -right-1 -top-2 text-[11px]">👑</span>
        </span>
        <span className="font-headline text-[11px] uppercase tracking-wide text-trophy-200">
          {teamDisplay(chip.team)}
        </span>
      </span>
    );
  }
  if (chip.status === "eliminado") {
    return (
      <span
        className="inline-flex items-center gap-1.5"
        title={chip.outRound ? `Eliminado en ${chip.outRound}` : "Eliminado"}
      >
        <Flag team={chip.team} size="sm" className="grayscale opacity-45" />
        <span className="font-headline text-[11px] uppercase tracking-wide text-ink-muted line-through decoration-ink-muted/60">
          {teamDisplay(chip.team)}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <Flag team={chip.team} size="sm" />
      <span className="font-headline text-[11px] uppercase tracking-wide text-ivory">
        {teamDisplay(chip.team)}
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-success-soft" aria-hidden />
    </span>
  );
}

function estadoLabel(e: Entry): { text: string; cls: string } {
  if (hasChampion(e)) return { text: "👑 Campeón", cls: "text-trophy-200" };
  const n = aliveCount(e);
  if (n === 2) return { text: "2 vivos", cls: "text-success-soft" };
  if (n === 1) return { text: "1 vivo", cls: "text-warning-soft" };
  return { text: "Sin chance", cls: "text-ink-muted" };
}

function ParticipantCard({ e }: { e: Entry }) {
  const estado = estadoLabel(e);
  const out = aliveCount(e) === 0 && !hasChampion(e);
  return (
    <div
      className={`rounded-card border p-3 transition ${
        hasChampion(e)
          ? "border-trophy-200/50 bg-trophy-200/[0.07] shadow-card"
          : e.isMe
            ? "border-trophy-200/30 bg-white/[0.05]"
            : out
              ? "border-white/5 bg-white/[0.02] opacity-60"
              : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 truncate font-headline text-sm uppercase tracking-wide text-ivory">
          {e.participant}
          {e.isMe && (
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
        <TeamRow chip={e.teams[0]} />
        <TeamRow chip={e.teams[1]} />
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

export function Tablero({ scenario }: { scenario: Scenario }) {
  const entries = useMemo(() => {
    const data = scenario === "final" ? toFinal(BASE) : BASE;
    return [...data].sort(
      (a, b) => rank(b) - rank(a) || a.participant.localeCompare(b.participant),
    );
  }, [scenario]);

  if (scenario === "pending") {
    return (
      <section className="surface-card p-6 text-center">
        <p className="text-5xl" aria-hidden>
          🎲
        </p>
        <p className="mt-3 font-display text-2xl uppercase tracking-wide text-trophy-200">
          El sorteo se corre esta noche
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Cuando cierren los grupos, cada quien recibe 2 equipos al azar. Gana quien tenga al
          campeón.
        </p>
        <p className="mt-3 font-headline text-xs uppercase tracking-[0.16em] text-ink-soft">
          16 participantes · pozo ${POT.toLocaleString("es-CO")}
        </p>
      </section>
    );
  }

  const me = entries.find((e) => e.isMe);
  const champion = entries.find(hasChampion);
  const conChance = entries.filter((e) => aliveCount(e) > 0 || hasChampion(e)).length;

  return (
    <div className="space-y-5">
      {champion && (
        <section className="overflow-hidden rounded-card border border-trophy-200/50 bg-trophy-200/[0.1] p-5 text-center shadow-card">
          <p className="text-4xl" aria-hidden>
            🏆
          </p>
          <p className="mt-2 font-display text-3xl uppercase tracking-wide text-trophy-200">
            ¡Ganó {champion.participant}!
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            con {teamDisplay(champion.teams.find((t) => t.status === "campeon")!.team)}, campeón del
            mundo 🌍
          </p>
        </section>
      )}

      {me && (
        <section>
          <h2 className="kicker mb-2">Tu pareja</h2>
          <div className="surface-card flex items-center justify-between gap-3 p-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <TeamRow chip={me.teams[0]} />
              <TeamRow chip={me.teams[1]} />
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
          {entries.map((e) => (
            <ParticipantCard key={e.participant} e={e} />
          ))}
        </div>
      </section>

      {scenario === "final" && champion && <ChampionBurst />}
    </div>
  );
}
