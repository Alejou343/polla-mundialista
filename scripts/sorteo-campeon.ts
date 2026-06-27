/**
 * SORTEO DE CAMPEÓN — reparte 32 equipos (los 16 cruces de dieciseisavos)
 * entre 16 participantes, 2 equipos a cada uno, AL AZAR.
 *
 * Reglas (confirmadas):
 *  - Se reparten los 32 equipos completos: 16 personas × 2 = 32.
 *  - Restricción: nadie recibe los DOS equipos de un mismo cruce de R32.
 *  - Gana quien tenga al campeón. (El dinero se maneja por fuera; el script no lo toca.)
 *
 * AZAR VERIFICABLE (decisión del grupo):
 *  - La semilla es el MARCADOR del último partido de grupos (dato público y futuro,
 *    imposible de amañar). Ej: "2-1".
 *  - Todo es DETERMINÍSTICO a partir de (semilla + listas ordenadas): cualquiera puede
 *    recomputar este script con los mismos datos y obtener EXACTAMENTE el mismo reparto.
 *    Así se comprueba que Alejo no eligió nada a mano.
 *
 * USO:
 *   npx tsx scripts/sorteo-campeon.ts                       # corre con datos de EJEMPLO
 *   npx tsx scripts/sorteo-campeon.ts sorteo-input.json     # corre con datos reales
 *
 * Formato del JSON de entrada (ver makeSampleInput() abajo para un ejemplo):
 *   {
 *     "seed": "2-1",
 *     "participants": ["Alejo", "Mamá", ... 16 nombres],
 *     "matchups": [ { "home": "Brazil", "away": "Japan" }, ... 16 cruces ]
 *   }
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Matchup = { home: string; away: string };
type Input = { seed: string; participants: string[]; matchups: Matchup[] };
type Assignment = { participant: string; teams: [string, string] };

// ── PRNG determinístico (mulberry32 + hash de string) ────────────────────────
// No usamos Math.random(): necesitamos reproducibilidad a partir de la semilla.
function hashStr(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Núcleo del sorteo ────────────────────────────────────────────────────────
function runDraw(input: Input): { assignments: Assignment[]; attempt: number } {
  const { seed, participants, matchups } = input;

  if (participants.length !== 16) {
    throw new Error(`Se esperaban 16 participantes, llegaron ${participants.length}.`);
  }
  if (matchups.length !== 16) {
    throw new Error(`Se esperaban 16 cruces de R32, llegaron ${matchups.length}.`);
  }

  // 32 equipos a partir de los cruces.
  const teams = matchups.flatMap((m) => [m.home, m.away]);
  const unique = new Set(teams);
  if (unique.size !== 32) {
    throw new Error(`Se esperaban 32 equipos distintos, hay ${unique.size} (¿duplicados?).`);
  }

  // Pares prohibidos: los dos equipos de un mismo cruce (no ordenado).
  const forbidden = new Set(matchups.map((m) => [m.home, m.away].sort().join(" :: ")));
  const isForbidden = (a: string, b: string) => forbidden.has([a, b].sort().join(" :: "));

  // Orden CANÓNICO de entradas → reproducibilidad total.
  const teamsSorted = [...teams].sort((a, b) => a.localeCompare(b));
  const peopleSorted = [...participants].sort((a, b) => a.localeCompare(b));

  // Intentos determinísticos: el intento k usa la semilla (seed + "#k").
  // Reintentamos hasta que ninguna pareja sea un cruce prohibido.
  // Con 16 cruces sobre 32 equipos, ~59% de éxito por intento (≈1–2 intentos).
  const MAX_ATTEMPTS = 10000;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = mulberry32(hashStr(`${seed}#${attempt}`));
    const shuffled = shuffle(teamsSorted, rng);

    const assignments: Assignment[] = [];
    let ok = true;
    for (let i = 0; i < 16; i++) {
      const t1 = shuffled[i * 2];
      const t2 = shuffled[i * 2 + 1];
      if (isForbidden(t1, t2)) {
        ok = false;
        break;
      }
      assignments.push({ participant: peopleSorted[i], teams: [t1, t2] });
    }
    if (ok) return { assignments, attempt };
  }
  throw new Error("No se encontró un reparto válido (no debería pasar). Revisa los datos.");
}

// ── Salida lista para WhatsApp ───────────────────────────────────────────────
function formatWhatsApp(
  input: Input,
  result: { assignments: Assignment[]; attempt: number },
): string {
  const lines: string[] = [];
  lines.push("🏆 *SORTEO DE CAMPEÓN — Mundial 2026* 🏆");
  lines.push("");
  lines.push("Cada quien apadrina 2 equipos. Gana quien tenga al campeón. 🤑");
  lines.push("");
  for (const a of result.assignments) {
    lines.push(`• *${a.participant}*: ${a.teams[0]}  +  ${a.teams[1]}`);
  }
  lines.push("");
  lines.push("─────────────");
  lines.push(`🎲 Semilla (marcador último partido de grupos): *${input.seed}*`);
  lines.push(`🔁 Intento válido #${result.attempt} · reparto reproducible y verificable`);
  lines.push("Cualquiera puede recomputar el script con esta semilla y obtener el mismo reparto.");
  return lines.join("\n");
}

// ── Datos de EJEMPLO (para probar el script antes de tener los reales) ───────
function makeSampleInput(): Input {
  const matchups: Matchup[] = [
    { home: "Brazil", away: "Japan" },
    { home: "Argentina", away: "Nigeria" },
    { home: "France", away: "Senegal" },
    { home: "Spain", away: "Uruguay" },
    { home: "England", away: "Ecuador" },
    { home: "Germany", away: "Morocco" },
    { home: "Portugal", away: "Mexico" },
    { home: "Netherlands", away: "USA" },
    { home: "Belgium", away: "Croatia" },
    { home: "Italy", away: "Switzerland" },
    { home: "Colombia", away: "Australia" },
    { home: "Denmark", away: "Canada" },
    { home: "Korea Republic", away: "Poland" },
    { home: "Serbia", away: "Ghana" },
    { home: "Norway", away: "Egypt" },
    { home: "Austria", away: "Saudi Arabia" },
  ];
  const participants = [
    "Alejo",
    "Mamá",
    "Papá",
    "Jaime",
    "Olga",
    "Carlos Mario",
    "Mariana",
    "Juan Carlos",
    "Lucía",
    "Andrés",
    "Sofía",
    "Camilo",
    "Valentina",
    "Daniel",
    "Paula",
    "Felipe",
  ];
  return { seed: "2-1", participants, matchups };
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const fileArg = process.argv[2];
  let input: Input;
  let usingSample = false;

  if (fileArg) {
    const raw = readFileSync(resolve(process.cwd(), fileArg), "utf8");
    input = JSON.parse(raw) as Input;
  } else {
    input = makeSampleInput();
    usingSample = true;
  }

  const result = runDraw(input);

  if (usingSample) {
    console.log("⚠️  DATOS DE EJEMPLO (no son los reales). Pasa un JSON para el sorteo real.\n");
  }
  console.log(formatWhatsApp(input, result));
}

main();
