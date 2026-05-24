/**
 * Mapa de los 48 equipos clasificados al Mundial 2026 (según openfootball).
 *
 * Las llaves son los nombres TAL CUAL aparecen en el JSON de openfootball
 * (en inglés). Los valores incluyen:
 *  - code: 2 letras estilo ISO-3166-alpha-2 (o aproximación para England/Scotland)
 *  - es:   nombre en español para mostrar en UI
 *
 * Para placeholders de knockout (ej. "2A", "W101", "3A/B/C/D/F") usar
 * `teamCode()` y `teamDisplay()` que devuelven labels amigables.
 */

interface TeamInfo {
  code: string;
  es: string;
}

const TEAMS: Record<string, TeamInfo> = {
  Algeria: { code: "DZ", es: "Argelia" },
  Argentina: { code: "AR", es: "Argentina" },
  Australia: { code: "AU", es: "Australia" },
  Austria: { code: "AT", es: "Austria" },
  Belgium: { code: "BE", es: "Bélgica" },
  "Bosnia & Herzegovina": { code: "BA", es: "Bosnia y Herzegovina" },
  Brazil: { code: "BR", es: "Brasil" },
  Canada: { code: "CA", es: "Canadá" },
  "Cape Verde": { code: "CV", es: "Cabo Verde" },
  Colombia: { code: "CO", es: "Colombia" },
  Croatia: { code: "HR", es: "Croacia" },
  Curaçao: { code: "CW", es: "Curazao" },
  "Czech Republic": { code: "CZ", es: "República Checa" },
  "DR Congo": { code: "CD", es: "RD del Congo" },
  Ecuador: { code: "EC", es: "Ecuador" },
  Egypt: { code: "EG", es: "Egipto" },
  England: { code: "EN", es: "Inglaterra" },
  France: { code: "FR", es: "Francia" },
  Germany: { code: "DE", es: "Alemania" },
  Ghana: { code: "GH", es: "Ghana" },
  Haiti: { code: "HT", es: "Haití" },
  Iran: { code: "IR", es: "Irán" },
  Iraq: { code: "IQ", es: "Irak" },
  "Ivory Coast": { code: "CI", es: "Costa de Marfil" },
  Japan: { code: "JP", es: "Japón" },
  Jordan: { code: "JO", es: "Jordania" },
  Mexico: { code: "MX", es: "México" },
  Morocco: { code: "MA", es: "Marruecos" },
  Netherlands: { code: "NL", es: "Países Bajos" },
  "New Zealand": { code: "NZ", es: "Nueva Zelanda" },
  Norway: { code: "NO", es: "Noruega" },
  Panama: { code: "PA", es: "Panamá" },
  Paraguay: { code: "PY", es: "Paraguay" },
  Portugal: { code: "PT", es: "Portugal" },
  Qatar: { code: "QA", es: "Catar" },
  "Saudi Arabia": { code: "SA", es: "Arabia Saudita" },
  Scotland: { code: "SC", es: "Escocia" },
  Senegal: { code: "SN", es: "Senegal" },
  "South Africa": { code: "ZA", es: "Sudáfrica" },
  "South Korea": { code: "KR", es: "Corea del Sur" },
  Spain: { code: "ES", es: "España" },
  Sweden: { code: "SE", es: "Suecia" },
  Switzerland: { code: "CH", es: "Suiza" },
  Tunisia: { code: "TN", es: "Túnez" },
  Turkey: { code: "TR", es: "Turquía" },
  USA: { code: "US", es: "Estados Unidos" },
  Uruguay: { code: "UY", es: "Uruguay" },
  Uzbekistan: { code: "UZ", es: "Uzbekistán" },
};

/**
 * Devuelve el código (2-letras) o un label corto para placeholders.
 * Ejemplos:
 *  - "Mexico"         → "MX"
 *  - "2A"             → "2A"
 *  - "W101"           → "W·101"
 *  - "3A/B/C/D/F"     → "3°"
 */
export function teamCode(name: string): string {
  const info = TEAMS[name];
  if (info) return info.code;
  // group placeholders: 1A, 2L, etc.
  if (/^[12][A-L]$/.test(name)) return name;
  // winner / loser of knockout match
  const wl = name.match(/^([WL])(\d+)$/);
  if (wl) return `${wl[1]}·${wl[2]}`;
  // best third (3A/B/...)
  if (name.startsWith("3")) return "3°";
  // fallback: primeros 3 caracteres
  return name.slice(0, 3).toUpperCase();
}

/**
 * Devuelve nombre amigable en español o un label legible para placeholders.
 * Ejemplos:
 *  - "Mexico"         → "México"
 *  - "2A"             → "2° de Grupo A"
 *  - "W101"           → "Ganador del 101"
 *  - "3A/B/C/D/F"     → "Mejor 3° (A/B/C/D/F)"
 */
export function teamDisplay(name: string): string {
  const info = TEAMS[name];
  if (info) return info.es;
  const g = name.match(/^([12])([A-L])$/);
  if (g) return `${g[1] === "1" ? "1°" : "2°"} de Grupo ${g[2]}`;
  const w = name.match(/^W(\d+)$/);
  if (w) return `Ganador del ${w[1]}`;
  const l = name.match(/^L(\d+)$/);
  if (l) return `Perdedor del ${l[1]}`;
  if (name.startsWith("3")) {
    const groups = name.slice(1);
    return `Mejor 3° (${groups})`;
  }
  return name;
}

/** True si el nombre corresponde a un equipo confirmado (no placeholder). */
export function isConfirmedTeam(name: string): boolean {
  return name in TEAMS;
}
