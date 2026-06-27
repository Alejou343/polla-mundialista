export type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "final" | "third";

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export interface Profile {
  id: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
}

export interface Match {
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
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  scored_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  points_earned: number | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_points: number;
  exact_scores: number;
  correct_results: number;
  total_bets: number;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

// ─── Sorteo de campeón ────────────────────────────────────────────────────────

export type DraftStatus = "pending" | "drawn" | "closed";

export type TeamStatus = "vivo" | "eliminado" | "campeon";

export interface DraftConfig {
  id: 1;
  status: DraftStatus;
  pot_amount: number; // COP
  draw_seed: string | null;
  drawn_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DraftEntry {
  id: string;
  user_id: string;
  team_code: string; // 'BRA', 'ARG', etc.
  team_name: string; // 'Brazil', 'Argentina'
  r32_match_id: string;
  assigned_at: string;
}

/** Fila de la vista draft_team_status: estado en tiempo real de cada equipo. */
export interface DraftTeamStatus {
  id: string;
  user_id: string;
  participant_name: string;
  team_code: string;
  team_name: string;
  r32_match_id: string;
  assigned_at: string;
  team_status: TeamStatus;
}

export const STAGE_LABELS: Record<Stage, string> = {
  group: "Fase de grupos",
  r32: "Dieciseisavos",
  r16: "Octavos",
  qf: "Cuartos",
  sf: "Semifinal",
  third: "Tercer puesto",
  final: "Final",
};

export const STATUS_LABELS: Record<MatchStatus, string> = {
  scheduled: "Programado",
  live: "En juego",
  finished: "Terminado",
  postponed: "Aplazado",
};
