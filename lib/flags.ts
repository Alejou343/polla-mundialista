import { isConfirmedTeam, teamCode } from "./teams";

/**
 * Equipos FIFA que no tienen código ISO-3166-alpha-2 propio.
 * Usamos los flag tag emojis (subdivisiones) que sí están soportados.
 */
const FLAG_OVERRIDES: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  // Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", // por si clasifica vía repechaje
};

const A_CODE = 65; // 'A'
const REGIONAL_A = 0x1f1e6; // 🇦

/**
 * Convierte un nombre de equipo en su emoji de bandera.
 * - Equipos confirmados con código ISO-2: emoji generado de regional indicators
 * - England/Scotland: override con flag tag emoji
 * - Placeholders de knockout (2A, W101, etc.): 🏳️ neutral
 */
export function teamFlagEmoji(name: string): string {
  if (FLAG_OVERRIDES[name]) return FLAG_OVERRIDES[name];
  if (!isConfirmedTeam(name)) return "🏳️";
  const code = teamCode(name);
  if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return "🏳️";
  const a = code.charCodeAt(0) - A_CODE + REGIONAL_A;
  const b = code.charCodeAt(1) - A_CODE + REGIONAL_A;
  return String.fromCodePoint(a, b);
}
