/**
 * Seed inicial de la tabla matches desde openfootball.
 *
 * Uso:
 *   npm run seed
 *
 * Requiere .env.local con:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Para correr en producción (sin .env.local), exporta las vars manualmente.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Cargador minimal de .env.local (evita agregar dotenv como dep).
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
import { fetchFixtures } from "@/lib/openfootball";

async function main() {
  console.log("⬇️  Descargando fixtures desde openfootball…");
  const fixtures = await fetchFixtures();
  console.log(`   Recibidos ${fixtures.length} partidos.`);

  // Inline admin client: lib/supabase/admin.ts importa 'server-only' que
  // explota fuera del bundler de Next. Este script corre en Node puro.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }
  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const rows = fixtures.map((m) => ({
    id: m.id,
    stage: m.stage,
    group_name: m.group_name,
    match_number: m.match_number,
    home_team: m.home_team,
    away_team: m.away_team,
    home_team_code: m.home_team_code,
    away_team_code: m.away_team_code,
    venue: m.venue,
    kickoff_time: m.kickoff_time,
    status: m.status,
    home_score: m.home_score,
    away_score: m.away_score,
  }));

  console.log("⬆️  Upserting en tabla matches…");
  const { error } = await admin.from("matches").upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }

  console.log(`✅ Seed completado. ${rows.length} filas.`);
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
