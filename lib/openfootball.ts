import { z } from "zod";
import type { Stage } from "./types";

const TeamSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    code: z.string().optional(),
  }),
]);

const ScoreSchema = z
  .object({
    ft: z.tuple([z.number(), z.number()]).optional(),
  })
  .nullable()
  .optional();

const StadiumSchema = z
  .union([
    z.string(),
    z.object({
      name: z.string(),
      city: z.string().optional(),
    }),
  ])
  .optional();

const RawMatchSchema = z.object({
  num: z.number().int(),
  date: z.string(),
  time: z.string().optional(),
  team1: TeamSchema,
  team2: TeamSchema,
  group: z.string().optional(),
  stage: z.string().optional(),
  stadium: StadiumSchema,
  score: ScoreSchema,
});

const RoundSchema = z.object({
  name: z.string(),
  matches: z.array(RawMatchSchema),
});

const WorldCupSchema = z.object({
  name: z.string().optional(),
  rounds: z.array(RoundSchema),
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

function inferStage(roundName: string, hasGroup: boolean): Stage {
  const n = roundName.toLowerCase().trim();
  if (n.includes("third") || n.includes("3rd")) return "third";
  if (n === "final" || n.endsWith(" final")) return "final";
  if (n.includes("semi")) return "sf";
  if (n.includes("quarter") || n.includes("qf")) return "qf";
  if (n.includes("round of 16") || n.includes("r16") || n.includes("eighth")) return "r16";
  if (n.includes("round of 32") || n.includes("r32")) return "r32";
  return hasGroup ? "group" : "group";
}

function teamName(t: z.infer<typeof TeamSchema>): string {
  return typeof t === "string" ? t : t.name;
}

function teamCode(t: z.infer<typeof TeamSchema>): string | null {
  return typeof t === "string" ? null : (t.code ?? null);
}

function venueName(v: z.infer<typeof StadiumSchema>): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : v.name;
}

export function parseFixtures(raw: unknown): ParsedMatch[] {
  const data = WorldCupSchema.parse(raw);
  const matches: ParsedMatch[] = [];
  for (const round of data.rounds) {
    for (const m of round.matches) {
      const groupName = m.group ?? null;
      const stage = inferStage(round.name, !!groupName);
      // openfootball no siempre incluye timezone. Asumimos UTC; el admin puede ajustar.
      const timeStr = m.time ?? "12:00";
      const kickoffDate = new Date(`${m.date}T${timeStr}:00Z`);
      if (Number.isNaN(kickoffDate.getTime())) {
        throw new Error(`openfootball: fecha inválida en match ${m.num}: ${m.date} ${timeStr}`);
      }
      const ft = m.score?.ft;
      matches.push({
        id: `WC2026-M${String(m.num).padStart(3, "0")}`,
        stage,
        group_name: groupName,
        match_number: m.num,
        home_team: teamName(m.team1),
        away_team: teamName(m.team2),
        home_team_code: teamCode(m.team1),
        away_team_code: teamCode(m.team2),
        venue: venueName(m.stadium),
        kickoff_time: kickoffDate.toISOString(),
        status: ft ? "finished" : "scheduled",
        home_score: ft ? ft[0] : null,
        away_score: ft ? ft[1] : null,
      });
    }
  }
  return matches;
}

export async function fetchFixtures(url: string = OPENFOOTBALL_URL): Promise<ParsedMatch[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`openfootball: fetch falló con status ${res.status}`);
  }
  const json = await res.json();
  return parseFixtures(json);
}
