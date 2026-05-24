import type { Match } from "./types";

/**
 * Estados visuales de un partido derivados de kickoff_time y status.
 * Mutuamente excluyentes; el orden de chequeo es:
 *   finished → live → closing-soon → upcoming
 */
export type MatchState = "finished" | "live" | "closing-soon" | "upcoming";

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

/**
 * Ventana en la que un partido se considera "en vivo": desde el kickoff
 * hasta 2h30 después (90' regular + ~15' descanso + margen para que el
 * cron de scoring marque finished).
 */
const LIVE_WINDOW_MS = 2.5 * ONE_HOUR_MS;

/**
 * Un partido entra en estado "closing-soon" cuando faltan ≤ 24h al kickoff.
 * Sirve para resaltar en UI las apuestas que la persona aún no hizo.
 */
const CLOSING_SOON_MS = 24 * ONE_HOUR_MS;

export function computeMatchState(
  match: Pick<Match, "kickoff_time" | "status">,
  now: Date = new Date(),
): MatchState {
  if (match.status === "finished") return "finished";
  const kickoff = new Date(match.kickoff_time).getTime();
  const t = now.getTime();

  // Después de la ventana de vida y sin status finished: probablemente el
  // cron aún no procesó. Lo tratamos como finished para no congelar la UI.
  if (kickoff + LIVE_WINDOW_MS <= t) return "finished";
  if (kickoff <= t) return "live";
  if (kickoff - t <= CLOSING_SOON_MS) return "closing-soon";
  return "upcoming";
}

/** Milisegundos hasta el kickoff. Negativo si ya pasó. */
export function msUntilKickoff(iso: string, now: Date = new Date()): number {
  return new Date(iso).getTime() - now.getTime();
}

/** Minutos aproximados desde el kickoff (para "Min 67'"). Mínimo 0. */
export function liveMinutesElapsed(iso: string, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60000));
}

/**
 * Formato amigable de un countdown en ms:
 *  - > 1 día → "2d 4h"
 *  - > 1 h   → "3h 24m"
 *  - > 1 min → "12m 45s"
 *  - < 1 min → "45s"
 *  - ≤ 0     → "Cerrado"
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Cerrado";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  return `${secs}s`;
}

/** Tono visual asociado al estado, para badges / borders / etc. */
export const STATE_TONE: Record<MatchState, string> = {
  finished: "text-carbon bg-carbon/10",
  live: "text-cancha bg-cancha/15",
  "closing-soon": "text-cancha bg-cancha/10",
  upcoming: "text-cesped bg-cesped/15",
};

export const STATE_LABEL: Record<MatchState, string> = {
  finished: "Final",
  live: "En vivo",
  "closing-soon": "Cierra pronto",
  upcoming: "Programado",
};
