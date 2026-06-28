import { teamCode, isConfirmedTeam } from "./teams";

/**
 * Lógica del bracket del "sorteo de campeón".
 *
 * openfootball encadena las eliminatorias con referencias "W<n>" (ganador del
 * partido n) y "L<n>" (perdedor). Aquí resolvemos cada slot al equipo real
 * cuando ya hay resultado (matches.winner_code), o null (por definir) si no.
 */

export type KMatch = {
  match_number: number;
  home_team: string;
  away_team: string;
  home_team_code: string | null;
  away_team_code: string | null;
  winner_code: string | null;
};

export type TeamRef = { name: string; code: string } | null;
export type BracketNode = { home: TeamRef; away: TeamRef; winnerCode: string | null };
export type SideData = {
  r32: BracketNode[];
  r16: BracketNode[];
  qf: BracketNode[];
  sf: BracketNode[];
};
export type BracketData = {
  left: SideData;
  right: SideData;
  final: BracketNode;
  champion: TeamRef;
};

// Estructura oficial del cuadro (números de partido por columna y lado).
const LEFT = {
  r32: [74, 77, 73, 75, 83, 84, 81, 82],
  r16: [89, 90, 93, 94],
  qf: [97, 98],
  sf: [101],
};
const RIGHT = {
  r32: [76, 78, 79, 80, 86, 88, 85, 87],
  r16: [91, 92, 95, 96],
  qf: [99, 100],
  sf: [102],
};
const FINAL = 104;

function resolveSlot(ref: string, byNum: Map<number, KMatch>): TeamRef {
  const wl = ref.match(/^([WL])(\d+)$/);
  if (!wl) return isConfirmedTeam(ref) ? { name: ref, code: teamCode(ref) } : null;
  const m = byNum.get(Number(wl[2]));
  if (!m || !m.winner_code) return null;
  const home = resolveSlot(m.home_team, byNum);
  const away = resolveSlot(m.away_team, byNum);
  if (wl[1] === "W") {
    if (home && home.code === m.winner_code) return home;
    if (away && away.code === m.winner_code) return away;
    return null;
  }
  // "L<n>": el perdedor (solo lo usa el 3er puesto).
  if (home && away) {
    if (home.code === m.winner_code) return away;
    if (away.code === m.winner_code) return home;
  }
  return null;
}

function makeNode(num: number, byNum: Map<number, KMatch>): BracketNode {
  const m = byNum.get(num);
  if (!m) return { home: null, away: null, winnerCode: null };
  return {
    home: resolveSlot(m.home_team, byNum),
    away: resolveSlot(m.away_team, byNum),
    winnerCode: m.winner_code,
  };
}

function makeSide(spec: typeof LEFT, byNum: Map<number, KMatch>): SideData {
  return {
    r32: spec.r32.map((n) => makeNode(n, byNum)),
    r16: spec.r16.map((n) => makeNode(n, byNum)),
    qf: spec.qf.map((n) => makeNode(n, byNum)),
    sf: spec.sf.map((n) => makeNode(n, byNum)),
  };
}

export function buildBracket(matches: KMatch[]): BracketData {
  const byNum = new Map(matches.map((m) => [m.match_number, m]));
  return {
    left: makeSide(LEFT, byNum),
    right: makeSide(RIGHT, byNum),
    final: makeNode(FINAL, byNum),
    champion: resolveSlot(`W${FINAL}`, byNum),
  };
}

export type TeamStatus = "vivo" | "eliminado" | "campeon";

/**
 * Deriva el estado (vivo/eliminado/campeón) de cada equipo a partir de los
 * resultados de las eliminatorias. Devuelve un mapa team_code → estado.
 */
export function computeTeamStatuses(matches: KMatch[]): Map<string, TeamStatus> {
  const byNum = new Map(matches.map((m) => [m.match_number, m]));
  const eliminated = new Set<string>();
  for (const m of matches) {
    if (!m.winner_code) continue;
    const home = resolveSlot(m.home_team, byNum);
    const away = resolveSlot(m.away_team, byNum);
    const loser = home?.code === m.winner_code ? away?.code : home?.code;
    if (loser) eliminated.add(loser);
  }
  const championCode = resolveSlot(`W${FINAL}`, byNum)?.code ?? null;

  const statuses = new Map<string, TeamStatus>();
  for (const c of eliminated) statuses.set(c, "eliminado");
  if (championCode) statuses.set(championCode, "campeon");
  return statuses;
}

/** Estado de un equipo dado el mapa (default vivo). */
export function statusOf(code: string, statuses: Map<string, TeamStatus>): TeamStatus {
  return statuses.get(code) ?? "vivo";
}
