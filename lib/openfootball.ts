import { z } from "zod";
import type { Stage } from "./types";

/**
 * Estructura real de https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json
 *
 * {
 *   "name": "World Cup 2026",
 *   "matches": [
 *     {
 *       "round": "Matchday 1",
 *       "date": "2026-06-11",
 *       "time": "13:00 UTC-6",
 *       "team1": "Mexico",
 *       "team2": "South Africa",
 *       "group": "Group A",
 *       "ground": "Mexico City"
 *     },
 *     {
 *       "round": "Round of 32",
 *       "num": 73,
 *       "date": "2026-06-28",
 *       "time": "12:00 UTC-7",
 *       "team1": "2A",    // placeholder hasta que se conozcan los clasificados
 *       "team2": "2B",
 *       "ground": "Los Angeles (Inglewood)"
 *     }
 *   ]
 * }
 */
const RawMatchSchema = z.object({
  round: z.string(),
  num: z.number().int().optional(),
  date: z.string(),
  time: z.string(),
  team1: z.string(),
  team2: z.string(),
  group: z.string().optional(),
  ground: z.string().optional(),
  score: z
    .object({
      ft: z.tuple([z.number(), z.number()]).optional(),
    })
    .nullable()
    .optional(),
});

const WorldCupSchema = z.object({
  name: z.string().optional(),
  matches: z.array(RawMatchSchema),
});

export type ParsedMatch = {
  id: string;
  stage: Stage;
  group_name: string | null;
  match_number: number;
  home_team: string;
  away_team: string;
  home_team_code: string | null;
  away_team_code: string | null;
  venue: string | null;
  kickoff_time: string;
  status: "scheduled" | "finished";
  home_score: number | null;
  away_score: number | null;
};

const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

function stageFor(round: string): Stage {
  const r = round.toLowerCase().trim();
  if (r === "final") return "final";
  if (r.includes("third") || r.includes("3rd")) return "third";
  if (r.includes("semi")) return "sf";
  if (r.includes("quarter")) return "qf";
  if (r.includes("round of 16") || r.includes("r16")) return "r16";
  if (r.includes("round of 32") || r.includes("r32")) return "r32";
  return "group";
}

function groupLetter(group: string | undefined): string | null {
  if (!group) return null;
  const m = group.match(/group\s+([a-z])/i);
  return m ? m[1].toUpperCase() : group;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

/** ID determinístico — estable entre syncs (sobrevive a cambios de fecha/sede). */
function makeId(round: string, team1: string, team2: string): string {
  return `WC2026-${slugify(round)}-${slugify(team1)}-${slugify(team2)}`;
}

/** Parsea "13:00 UTC-6" o "20:00 UTC+1" o "12:00" a ISO UTC. */
function parseKickoffISO(date: string, time: string): string {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})(?:\s+UTC\s*([+-]?\d{1,2}))?$/);
  if (!m) throw new Error(`openfootball: hora inválida "${time}"`);
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const offset = m[3] ? parseInt(m[3], 10) : 0;
  const baseUTC = new Date(`${date}T00:00:00Z`).getTime();
  if (Number.isNaN(baseUTC)) {
    throw new Error(`openfootball: fecha inválida "${date}"`);
  }
  // hora local = UTC + offset ⇒ UTC = local - offset
  const ms = baseUTC + (hh - offset) * 3_600_000 + mm * 60_000;
  return new Date(ms).toISOString();
}

export function parseFixtures(raw: unknown): ParsedMatch[] {
  const data = WorldCupSchema.parse(raw);
  return data.matches.map((m, idx) => {
    const ft = m.score?.ft;
    return {
      id: makeId(m.round, m.team1, m.team2),
      stage: stageFor(m.round),
      group_name: groupLetter(m.group),
      match_number: m.num ?? idx + 1,
      home_team: m.team1,
      away_team: m.team2,
      home_team_code: null,
      away_team_code: null,
      venue: m.ground ?? null,
      kickoff_time: parseKickoffISO(m.date, m.time),
      status: ft ? "finished" : "scheduled",
      home_score: ft ? ft[0] : null,
      away_score: ft ? ft[1] : null,
    };
  });
}

export async function fetchFixtures(url: string = OPENFOOTBALL_URL): Promise<ParsedMatch[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`openfootball: fetch falló con status ${res.status}`);
  }
  const json = await res.json();
  return parseFixtures(json);
}
