/**
 * Persiste el resultado del sorteo en draft_entries + draft_config.
 *
 * Reusa EXACTAMENTE runDraw() del script verificable (mismo resultado que ya
 * mostramos). Mapea: participante→user_id (profiles), equipo→team_code +
 * r32_match_id (matches). Inserta 32 filas y marca draft_config='drawn'.
 *
 * SEGURIDAD: dry-run por defecto. Para ejecutar: APPLY=1 npx tsx scripts/persist-sorteo.ts
 * Aborta si draft_entries ya tiene filas (no duplica un sorteo previo).
 *
 * Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
} catch {
  // ok
}

import { createClient } from "@supabase/supabase-js";
import { runDraw, type Input } from "./sorteo-campeon";

const APPLY = process.env.APPLY === "1";

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

  // 1. Reproducir el sorteo desde el mismo input.
  const input = JSON.parse(
    readFileSync(resolve(process.cwd(), "sorteo-input.json"), "utf8"),
  ) as Input;
  const { assignments, attempt } = runDraw(input);
  console.log(`🎲 Sorteo reproducido (semilla ${input.seed}, intento #${attempt}).`);

  // 2. Mapear participante → user_id.
  const { data: profiles, error: pErr } = await admin.from("profiles").select("id, display_name");
  if (pErr) {
    console.error("❌ Error leyendo profiles:", pErr.message);
    process.exit(1);
  }
  const userIdByName = new Map((profiles ?? []).map((p) => [p.display_name.trim(), p.id]));

  // 3. Mapear equipo → { code, r32_match_id }.
  const { data: r32, error: mErr } = await admin
    .from("matches")
    .select("id, home_team, away_team, home_team_code, away_team_code")
    .eq("stage", "r32");
  if (mErr) {
    console.error("❌ Error leyendo R32:", mErr.message);
    process.exit(1);
  }
  const teamMeta = new Map<string, { code: string; matchId: string }>();
  for (const m of r32 ?? []) {
    teamMeta.set(m.home_team, { code: m.home_team_code, matchId: m.id });
    teamMeta.set(m.away_team, { code: m.away_team_code, matchId: m.id });
  }

  // 4. Construir las 32 filas de draft_entries.
  const rows: {
    user_id: string;
    team_code: string;
    team_name: string;
    r32_match_id: string;
  }[] = [];
  const problemas: string[] = [];
  for (const a of assignments) {
    const userId = userIdByName.get(a.participant.trim());
    if (!userId) problemas.push(`Participante sin perfil: "${a.participant}"`);
    for (const team of a.teams) {
      const meta = teamMeta.get(team);
      if (!meta) problemas.push(`Equipo sin metadata R32: "${team}"`);
      if (userId && meta) {
        rows.push({
          user_id: userId,
          team_code: meta.code,
          team_name: team,
          r32_match_id: meta.matchId,
        });
      }
    }
  }

  if (problemas.length) {
    console.error("❌ No se pudo mapear todo:");
    problemas.forEach((p) => console.error("   " + p));
    process.exit(1);
  }

  // 5. Validaciones locales (espejo de los candados de la BD).
  const teamCodes = rows.map((r) => r.team_code);
  if (new Set(teamCodes).size !== 32) {
    console.error(`❌ Códigos de equipo no únicos (${new Set(teamCodes).size}/32).`);
    process.exit(1);
  }
  const byUser = new Map<string, string[]>();
  for (const r of rows) {
    if (!byUser.has(r.user_id)) byUser.set(r.user_id, []);
    byUser.get(r.user_id)!.push(r.r32_match_id);
  }
  for (const [uid, matchIds] of byUser) {
    if (matchIds.length !== 2) {
      console.error(`❌ Usuario ${uid} tiene ${matchIds.length} equipos (deberían ser 2).`);
      process.exit(1);
    }
    if (matchIds[0] === matchIds[1]) {
      console.error(`❌ Usuario ${uid} tiene los DOS lados de un cruce R32. Aborto.`);
      process.exit(1);
    }
  }
  console.log(
    `✅ Validación local: 32 equipos únicos · 16 usuarios × 2 · sin enfrentamientos R32.`,
  );

  // 6. Pre-check: no sobrescribir un sorteo ya guardado.
  const { count } = await admin.from("draft_entries").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) {
    console.error(`⛔ draft_entries ya tiene ${count} filas. Aborto para no duplicar.`);
    process.exit(1);
  }

  console.log(`\n📋 32 asignaciones a insertar:`);
  for (const a of assignments) {
    console.log(`   ${a.participant}: ${a.teams[0]} + ${a.teams[1]}`);
  }

  if (!APPLY) {
    console.log(
      "\n🔎 DRY-RUN. No se escribió nada. Para ejecutar: APPLY=1 npx tsx scripts/persist-sorteo.ts",
    );
    return;
  }

  // 7. Insertar y marcar drawn.
  const { error: insErr } = await admin.from("draft_entries").insert(rows);
  if (insErr) {
    console.error("❌ Error insertando draft_entries:", insErr.message);
    process.exit(1);
  }
  const { error: cfgErr } = await admin
    .from("draft_config")
    .update({ status: "drawn", draw_seed: input.seed, drawn_at: new Date().toISOString() })
    .eq("id", 1);
  if (cfgErr) {
    console.error("❌ Error actualizando draft_config:", cfgErr.message);
    process.exit(1);
  }

  const { count: finalCount } = await admin
    .from("draft_entries")
    .select("id", { count: "exact", head: true });
  console.log(
    `\n✅ Listo. draft_entries: ${finalCount} filas · draft_config.status='drawn' · semilla='${input.seed}'.`,
  );
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
