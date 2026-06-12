import { computeMatchState } from "./match-state";
import { timeShort, tournamentDayLong } from "./format";
import { teamFlagEmoji } from "./flags";
import { isConfirmedTeam, teamDisplay } from "./teams";
import type { Match } from "./types";

const APP_URL = "https://polla-mundialista-pi.vercel.app";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function teamSegment(name: string): string {
  const display = teamDisplay(name);
  return isConfirmedTeam(name) ? `${teamFlagEmoji(name)} ${display}` : display;
}

function venueLine(match: Match): string {
  const parts: string[] = [];
  if (match.venue) parts.push(`📍 ${match.venue}`);
  if (match.group_name) parts.push(`Grupo ${match.group_name}`);
  return parts.join(" · ");
}

function matchBlock(match: Match): string {
  const state = computeMatchState(match);
  const time = timeShort(match.kickoff_time);
  const home = teamSegment(match.home_team);
  const away = teamSegment(match.away_team);

  let header: string;
  if (state === "finished" && match.home_score !== null && match.away_score !== null) {
    header = `✅ *${time}* — ${home} *${match.home_score}–${match.away_score}* ${away}`;
  } else if (state === "live") {
    const live =
      match.home_score !== null && match.away_score !== null
        ? ` (${match.home_score}–${match.away_score})`
        : "";
    header = `🔴 *EN VIVO* — ${home} vs ${away}${live}`;
  } else {
    header = `⏰ *${time}* — ${home} vs ${away}`;
  }

  const ven = venueLine(match);
  return ven ? `${header}\n   ${ven}` : header;
}

/**
 * Construye el mensaje listo para pegar en WhatsApp. Usa marcado de WhatsApp
 * (*bold*) que renderiza nativo en la app.
 */
export function formatDailyDigest(matches: Match[], referenceIso: string): string {
  const day = capitalize(tournamentDayLong(referenceIso));
  const head = `🏆 *POLLA FAMILIAR MUNDIAL 2026*\n🗓️ ${day}`;

  if (matches.length === 0) {
    return [
      head,
      "",
      "📭 Hoy no juega nadie del Mundial.",
      "Aprovechen para revisar las apuestas que vienen ⬇️",
      "",
      `${APP_URL}/matches`,
    ].join("\n");
  }

  const live = matches.filter((m) => computeMatchState(m) === "live");
  const upcoming = matches.filter((m) => {
    const s = computeMatchState(m);
    return s === "upcoming" || s === "closing-soon";
  });
  const finished = matches.filter((m) => computeMatchState(m) === "finished");

  const sections: string[] = [];

  if (upcoming.length) {
    sections.push("⚽ *Partidos de hoy:*");
    sections.push(upcoming.map(matchBlock).join("\n\n"));
  }

  if (live.length) {
    sections.push("🔴 *Ahora mismo:*");
    sections.push(live.map(matchBlock).join("\n\n"));
  }

  if (finished.length) {
    sections.push("✅ *Ya terminaron:*");
    sections.push(finished.map(matchBlock).join("\n\n"));
  }

  // Call to action solo si hay partidos abiertos
  const cta =
    upcoming.length > 0
      ? ["", "⏱️ *Apuesten antes del pitazo inicial* ⬇️", `${APP_URL}/matches?view=pending`].join(
          "\n",
        )
      : ["", `Ver el ranking ➡️ ${APP_URL}/ranking`].join("\n");

  return [head, "", sections.join("\n\n"), cta].join("\n");
}
