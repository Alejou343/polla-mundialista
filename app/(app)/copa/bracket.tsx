"use client";

import { Flag } from "@/components/Flag";
import { teamDisplay } from "@/lib/teams";
import type { BracketData, BracketNode, TeamRef } from "@/lib/copa-bracket";

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

export function Bracket({ bracket, myCodes }: { bracket: BracketData; myCodes: string[] }) {
  const mine = new Set(myCodes);
  const leftCols = [bracket.left.r32, bracket.left.r16, bracket.left.qf, bracket.left.sf];
  const rightCols = [bracket.right.sf, bracket.right.qf, bracket.right.r16, bracket.right.r32];
  const rightLabels = [...SIDE_LABELS].reverse();

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
            {leftCols.map((nodes, r) => (
              <SideColumn key={`L${r}`} label={SIDE_LABELS[r]} nodes={nodes} mine={mine} />
            ))}

            <div className="flex shrink-0 flex-col" style={{ width: CENTER_W }}>
              <h2 className="flex h-4 items-center justify-center text-[11px] text-trophy-200">
                🏆
              </h2>
              <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
                <FlagNode
                  team={bracket.final.home}
                  winnerCode={bracket.final.winnerCode}
                  mine={mine}
                />
                <FlagNode
                  team={bracket.final.away}
                  winnerCode={bracket.final.winnerCode}
                  mine={mine}
                />
                {bracket.champion && (
                  <span className="mt-1 text-center font-headline text-[9px] uppercase leading-tight tracking-wide text-trophy-200">
                    {teamDisplay(bracket.champion.name)}
                  </span>
                )}
              </div>
            </div>

            {rightCols.map((nodes, r) => (
              <SideColumn key={`R${r}`} label={rightLabels[r]} nodes={nodes} mine={mine} />
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

function SideColumn({
  label,
  nodes,
  mine,
}: {
  label: string;
  nodes: BracketNode[];
  mine: Set<string>;
}) {
  return (
    <div className="flex shrink-0 flex-col" style={{ width: SIDE_W }}>
      <h2 className="mb-2 flex h-4 items-center justify-center font-headline text-[9px] uppercase tracking-tight text-ink-muted">
        {label}
      </h2>
      <div className="flex flex-1 flex-col justify-around">
        {nodes.map((n, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <FlagNode team={n.home} winnerCode={n.winnerCode} mine={mine} />
            <FlagNode team={n.away} winnerCode={n.winnerCode} mine={mine} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FlagNode({
  team,
  winnerCode,
  mine,
}: {
  team: TeamRef;
  winnerCode: string | null;
  mine: Set<string>;
}) {
  if (!team) {
    return <span className="h-3.5 w-5 rounded-sm bg-white/5 ring-1 ring-white/10" aria-hidden />;
  }
  const isLoser = winnerCode !== null && winnerCode !== team.code;
  const isMine = mine.has(team.code);
  return (
    <span title={teamDisplay(team.name)} className="relative inline-flex">
      <Flag
        team={team.name}
        size="sm"
        className={`${isLoser ? "grayscale opacity-40" : ""} ${isMine ? "ring-2 ring-trophy-200" : ""}`}
      />
      {isMine && (
        <span className="absolute -right-1.5 -top-1.5 text-[8px] leading-none" aria-hidden>
          ⭐
        </span>
      )}
    </span>
  );
}
