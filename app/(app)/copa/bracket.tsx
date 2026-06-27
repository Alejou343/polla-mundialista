"use client";

import { useMemo } from "react";
import { Flag } from "@/components/Flag";
import { teamDisplay } from "@/lib/teams";

const R32_TEAMS = [
  "Brazil",
  "Japan",
  "Spain",
  "Morocco",
  "France",
  "Senegal",
  "England",
  "Ecuador",
  "Argentina",
  "Nigeria",
  "Germany",
  "Mexico",
  "Portugal",
  "USA",
  "Netherlands",
  "Croatia",
  "Belgium",
  "Canada",
  "Italy",
  "Switzerland",
  "Colombia",
  "Australia",
  "Uruguay",
  "Ghana",
  "Denmark",
  "Poland",
  "Korea Republic",
  "Serbia",
  "Norway",
  "Egypt",
  "Austria",
  "Qatar",
];

// En la app real, este set = los 2 equipos del usuario logueado (draft_entries).
const MIS_EQUIPOS = new Set(["Brazil", "Italy"]);
const SIDE_LABELS = ["1/16", "1/8", "1/4", "½"];

const SIDE_W = 28;
const CENTER_W = 52;
const GAP = 5;
const HEADER_H = 24;
const BRACKET_H = 560;
const COL_WIDTHS = [SIDE_W, SIDE_W, SIDE_W, SIDE_W, CENTER_W, SIDE_W, SIDE_W, SIDE_W, SIDE_W];
const COL_COUNT: Record<number, number> = { 0: 8, 1: 4, 2: 2, 3: 1, 5: 1, 6: 2, 7: 4, 8: 8 };

function colCenters(): number[] {
  const xs: number[] = [];
  let x = 0;
  for (const w of COL_WIDTHS) {
    xs.push(x + w / 2);
    x += w + GAP;
  }
  return xs;
}
const COL_X = colCenters();
const TOTAL_W = COL_WIDTHS.reduce((a, b) => a + b, 0) + GAP * (COL_WIDTHS.length - 1);

function nodeY(count: number, i: number): number {
  return HEADER_H + (BRACKET_H - HEADER_H) * ((i + 0.5) / count);
}

// Conectores en "codo" (solo horizontales y verticales).
function buildConnectors(): { x1: number; y1: number; x2: number; y2: number }[] {
  const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const elbow = (pCol: number, cCol: number) => {
    const pc = COL_COUNT[pCol];
    const cc = COL_COUNT[cCol];
    const childX = COL_X[cCol];
    const parentX = COL_X[pCol];
    const midX = (childX + parentX) / 2;
    for (let i = 0; i < pc; i++) {
      const y1 = nodeY(cc, 2 * i);
      const y2 = nodeY(cc, 2 * i + 1);
      const yp = nodeY(pc, i);
      segs.push({ x1: childX, y1, x2: midX, y2: y1 });
      segs.push({ x1: childX, y1: y2, x2: midX, y2 });
      segs.push({ x1: midX, y1, x2: midX, y2 });
      segs.push({ x1: midX, y1: yp, x2: parentX, y2: yp });
    }
  };
  elbow(1, 0);
  elbow(2, 1);
  elbow(3, 2);
  elbow(5, 6);
  elbow(6, 7);
  elbow(7, 8);
  const cy = HEADER_H + (BRACKET_H - HEADER_H) / 2;
  segs.push({ x1: COL_X[3], y1: cy, x2: COL_X[4], y2: cy });
  segs.push({ x1: COL_X[5], y1: cy, x2: COL_X[4], y2: cy });
  return segs;
}
const CONNECTORS = buildConnectors();

function nextRound(prev: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < prev.length; i += 2) out.push(prev[i]);
  return out;
}

type Match = { home: string | null; away: string | null; winner: string | null };

function buildSide(half: string[], completed: number) {
  const tbr: string[][] = [half];
  for (let r = 1; r <= 4; r++) tbr.push(nextRound(tbr[r - 1]));
  const rounds: Match[][] = [];
  for (let r = 0; r < 4; r++) {
    const known = completed >= r;
    const winnerKnown = completed >= r + 1;
    const teams = tbr[r];
    const ms: Match[] = [];
    for (let i = 0; i < teams.length; i += 2) {
      ms.push({
        home: known ? teams[i] : null,
        away: known ? teams[i + 1] : null,
        winner: winnerKnown ? teams[i] : null,
      });
    }
    rounds.push(ms);
  }
  return { rounds, finalist: completed >= 4 ? tbr[4][0] : null };
}

export function Bracket({ completed }: { completed: number }) {
  const { left, right, champion } = useMemo(() => {
    const left = buildSide(R32_TEAMS.slice(0, 16), completed);
    const right = buildSide(R32_TEAMS.slice(16), completed);
    return { left, right, champion: completed >= 5 ? left.finalist : null };
  }, [completed]);

  return (
    <div className="space-y-3">
      <div className="surface-card overflow-x-auto p-2">
        <div className="relative mx-auto" style={{ width: TOTAL_W, height: BRACKET_H }}>
          <svg
            className="pointer-events-none absolute inset-0"
            width={TOTAL_W}
            height={BRACKET_H}
            viewBox={`0 0 ${TOTAL_W} ${BRACKET_H}`}
            aria-hidden
          >
            {CONNECTORS.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="rgba(255,255,255,0.13)"
                strokeWidth={1}
              />
            ))}
          </svg>

          <div className="relative flex h-full" style={{ gap: GAP }}>
            {left.rounds.map((matches, r) => (
              <SideColumn key={`L${r}`} label={SIDE_LABELS[r]} matches={matches} />
            ))}

            <div className="flex shrink-0 flex-col" style={{ width: CENTER_W }}>
              <h2 className="flex h-4 items-center justify-center text-[11px] text-trophy-200">
                🏆
              </h2>
              <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
                <FlagNode team={left.finalist} winner={champion} />
                <FlagNode team={right.finalist} winner={champion} />
                {champion && (
                  <span className="mt-1 text-center font-headline text-[9px] uppercase leading-tight tracking-wide text-trophy-200">
                    {teamDisplay(champion)}
                  </span>
                )}
              </div>
            </div>

            {[...right.rounds]
              .map((matches, r) => ({ matches, r }))
              .reverse()
              .map(({ matches, r }) => (
                <SideColumn key={`R${r}`} label={SIDE_LABELS[r]} matches={matches} />
              ))}
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-ink-muted">
        Eliminados en gris · tus equipos llevan ⭐ y borde dorado
      </p>
    </div>
  );
}

function SideColumn({ label, matches }: { label: string; matches: Match[] }) {
  return (
    <div className="flex shrink-0 flex-col" style={{ width: SIDE_W }}>
      <h2 className="flex h-4 items-center justify-center font-headline text-[9px] uppercase tracking-tight text-ink-muted">
        {label}
      </h2>
      <div className="flex flex-1 flex-col justify-around">
        {matches.map((m, i) => (
          <MatchNode key={i} m={m} />
        ))}
      </div>
    </div>
  );
}

function MatchNode({ m }: { m: Match }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <FlagNode team={m.home} winner={m.winner} />
      <FlagNode team={m.away} winner={m.winner} />
    </div>
  );
}

function FlagNode({ team, winner }: { team: string | null; winner: string | null }) {
  if (!team) {
    return <span className="h-3.5 w-5 rounded-sm bg-white/5 ring-1 ring-white/10" aria-hidden />;
  }
  const isLoser = winner !== null && winner !== team;
  const mine = MIS_EQUIPOS.has(team);
  return (
    <span title={teamDisplay(team)} className="relative inline-flex">
      <Flag
        team={team}
        size="sm"
        className={`${isLoser ? "grayscale opacity-40" : ""} ${mine ? "ring-2 ring-trophy-200" : ""}`}
      />
      {mine && (
        <span className="absolute -right-1.5 -top-1.5 text-[8px] leading-none" aria-hidden>
          ⭐
        </span>
      )}
    </span>
  );
}
