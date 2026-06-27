/**
 * Limpia filas DUPLICADAS de partidos de eliminatorias en la tabla `matches`.
 *
 * Causa raíz: el id de cada partido se deriva de los nombres de equipo
 * (lib/openfootball.ts → makeId). Cuando openfootball resuelve un placeholder
 * (p.ej. "2F" → "Japan") el id cambia y el sync hace upsert(onConflict:"id")
 * SIN borrar, así que la versión vieja queda huérfana. Resultado: varias filas
 * por mismo (stage, match_number).
 *
 * Este script conserva, por cada (stage, match_number), la fila con `updated_at`
 * más reciente (= la más resuelta, la que toca el último sync) y borra el resto.
 *
 * SEGURIDAD:
 *  - DRY-RUN por defecto. Imprime el plan y NO escribe nada.
 *    Para ejecutar de verdad: APPLY=1 npx tsx scripts/cleanup-knockout-dupes.ts
 *  - Si alguna apuesta apunta a una fila que se iba a borrar, ABORTA sin tocar
 *    nada (esas apuestas habría que repuntarlas a mano primero).
 *
 * Uso:
 *   npx tsx scripts/cleanup-knockout-dupes.ts          # dry-run (solo muestra)
 *   APPLY=1 npx tsx scripts/cleanup-knockout-dupes.ts  # ejecuta el borrado
 *
 * Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Cargador minimal de .env.local (mismo patrón que scripts/seed.ts).
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
} catch {
  // ok: variables ya pueden venir del entorno
}

import { createClient } from "@supabase/supabase-js";

const KNOCKOUT_STAGES = ["r32", "r16", "qf", "sf", "final", "third"];
const APPLY = process.env.APPLY === "1";

type Row = {
  id: string;
  stage: string;
  match_number: number;
  home_team: string;
  away_team: string;
  updated_at: string;
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin
    .from("matches")
    .select("id, stage, match_number, home_team, away_team, updated_at")
    .in("stage", KNOCKOUT_STAGES);
  if (error) {
    console.error("❌ Error leyendo matches:", error.message);
    process.exit(1);
  }
  const rows = (data ?? []) as Row[];

  // Agrupar por (stage, match_number).
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const key = `${r.stage}#${r.match_number}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const keep: Row[] = [];
  const drop: Row[] = [];
  for (const group of groups.values()) {
    // Más reciente primero; desempate determinístico por id.
    group.sort((a, b) =>
      a.updated_at === b.updated_at
        ? b.id.localeCompare(a.id)
        : b.updated_at.localeCompare(a.updated_at),
    );
    keep.push(group[0]);
    drop.push(...group.slice(1));
  }

  console.log(`📊 Eliminatorias: ${rows.length} filas en ${groups.size} partidos.`);
  console.log(`   Conservar: ${keep.length}  ·  Borrar (duplicados): ${drop.length}`);

  if (drop.length === 0) {
    console.log("✅ Nada que limpiar. Sin duplicados.");
    return;
  }

  console.log("\n🗑️  Filas a borrar (duplicados obsoletos):");
  for (const r of drop.sort((a, b) => a.match_number - b.match_number)) {
    console.log(`   [${r.stage} #${r.match_number}] ${r.home_team} vs ${r.away_team}  (${r.id})`);
  }

  // Seguridad: ¿alguna apuesta apunta a una fila que vamos a borrar?
  const dropIds = drop.map((r) => r.id);
  const { data: betRows, error: betErr } = await admin
    .from("bets")
    .select("id, match_id, user_id")
    .in("match_id", dropIds);
  if (betErr) {
    console.error("❌ Error verificando apuestas:", betErr.message);
    process.exit(1);
  }
  if (betRows && betRows.length > 0) {
    console.error(
      `\n⛔ ABORTADO: ${betRows.length} apuesta(s) apuntan a filas que se iban a borrar.`,
    );
    for (const b of betRows) {
      console.error(`   bet ${b.id} (user ${b.user_id}) → match ${b.match_id}`);
    }
    console.error(
      "   Repunta esas apuestas a la fila correcta del mismo partido antes de limpiar.",
    );
    process.exit(1);
  }
  console.log("\n✅ Verificación: ninguna apuesta apunta a las filas a borrar.");

  if (!APPLY) {
    console.log("\n🔎 DRY-RUN. No se borró nada.");
    console.log("   Para ejecutar: APPLY=1 npx tsx scripts/cleanup-knockout-dupes.ts");
    return;
  }

  const { error: delErr } = await admin.from("matches").delete().in("id", dropIds);
  if (delErr) {
    console.error("❌ Error borrando:", delErr.message);
    process.exit(1);
  }

  // Re-verificar.
  const { count } = await admin
    .from("matches")
    .select("id", { count: "exact", head: true })
    .in("stage", KNOCKOUT_STAGES);
  console.log(`\n✅ Listo. Borradas ${drop.length} filas. Eliminatorias ahora: ${count} filas.`);
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
