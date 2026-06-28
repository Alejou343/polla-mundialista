/**
 * Backfill de los 16 cruces de dieciseisavos (R32) desde openfootball.
 *
 * Qué hace (solo toca stage='r32', NO grupos ni partidos jugados):
 *  1. Trae los 16 cruces ya resueltos de openfootball.
 *  2. Les calcula home_team_code / away_team_code desde lib/teams.
 *  3. Upsert con el id canónico (WC2026-roundof32-<a>-<b>).
 *  4. Borra las filas R32 obsoletas (placeholders viejos) que ya no estén en
 *     el set actual, salvo que estén finalizadas o tengan apuestas.
 *
 * SEGURIDAD: dry-run por defecto. Para ejecutar: APPLY=1 npx tsx scripts/backfill-r32.ts
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
import { fetchFixtures } from "@/lib/openfootball";
import { teamCode, isConfirmedTeam } from "@/lib/teams";

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

  console.log("⬇️  Trayendo fixtures de openfootball…");
  const fixtures = await fetchFixtures();
  const r32 = fixtures.filter((m) => m.stage === "r32");
  if (r32.length !== 16) {
    console.error(`❌ Esperaba 16 cruces R32, openfootball trae ${r32.length}. Aborto.`);
    process.exit(1);
  }

  // ¿Siguen quedando placeholders en la fuente? (no debería)
  const sinResolver = r32.filter(
    (m) => !isConfirmedTeam(m.home_team) || !isConfirmedTeam(m.away_team),
  );
  if (sinResolver.length) {
    console.error("❌ openfootball aún tiene placeholders en R32:");
    for (const m of sinResolver)
      console.error(`   #${m.match_number} ${m.home_team} vs ${m.away_team}`);
    console.error("   No se puede hacer backfill todavía. Aborto.");
    process.exit(1);
  }

  // Filas a escribir, con códigos.
  const rows = r32
    .sort((a, b) => a.match_number - b.match_number)
    .map((m) => ({
      id: m.id,
      stage: m.stage,
      group_name: m.group_name,
      match_number: m.match_number,
      home_team: m.home_team,
      away_team: m.away_team,
      home_team_code: teamCode(m.home_team),
      away_team_code: teamCode(m.away_team),
      venue: m.venue,
      kickoff_time: m.kickoff_time,
      status: m.status,
      home_score: m.home_score,
      away_score: m.away_score,
    }));

  console.log("\n🆕 16 cruces resueltos (con código):");
  for (const r of rows) {
    console.log(
      `   #${r.match_number}  ${r.home_team} (${r.home_team_code})  vs  ${r.away_team} (${r.away_team_code})`,
    );
  }

  // Filas R32 actuales en la DB → detectar obsoletas.
  const { data: existing, error: exErr } = await admin
    .from("matches")
    .select("id, match_number, status")
    .eq("stage", "r32");
  if (exErr) {
    console.error("❌ Error leyendo R32 actual:", exErr.message);
    process.exit(1);
  }
  const newIds = new Set(rows.map((r) => r.id));
  const newIdByNum = new Map(rows.map((r) => [r.match_number, r.id]));
  const stale = (existing ?? []).filter((e) => !newIds.has(e.id) && e.status !== "finished");
  const staleIds = stale.map((s) => s.id);
  // Mapa id_obsoleto → id_nuevo (mismo match_number) para repuntar apuestas.
  const remap = new Map(stale.map((s) => [s.id, newIdByNum.get(s.match_number)!]));

  // Apuestas sobre filas obsoletas: NO se borran, se repuntan al cruce ya resuelto.
  const { data: betsOnStale } = staleIds.length
    ? await admin.from("bets").select("id, match_id").in("match_id", staleIds)
    : { data: [] as { id: string; match_id: string }[] };
  const toRepoint = betsOnStale ?? [];

  console.log(`\n🗑️  Filas obsoletas a borrar: ${staleIds.length}`);
  staleIds.forEach((id) => console.log(`   ${id}  →  ${remap.get(id)}`));

  console.log(`\n♻️  Apuestas a repuntar (predicción se conserva): ${toRepoint.length}`);
  toRepoint.forEach((b) =>
    console.log(`   bet ${b.id}: ${b.match_id}  →  ${remap.get(b.match_id)}`),
  );

  if (!APPLY) {
    console.log(
      "\n🔎 DRY-RUN. No se escribió nada. Para ejecutar: APPLY=1 npx tsx scripts/backfill-r32.ts",
    );
    return;
  }

  console.log("\n⬆️  Upsert de 16 cruces…");
  const { error: upErr } = await admin.from("matches").upsert(rows, { onConflict: "id" });
  if (upErr) {
    console.error("❌ Error en upsert:", upErr.message);
    process.exit(1);
  }

  // Repuntar apuestas al id nuevo (ya existe tras el upsert) antes de borrar.
  for (const b of toRepoint) {
    const newId = remap.get(b.match_id);
    if (!newId) continue;
    const { error: rpErr } = await admin.from("bets").update({ match_id: newId }).eq("id", b.id);
    if (rpErr) {
      console.error(`❌ Error repuntando bet ${b.id}:`, rpErr.message);
      process.exit(1);
    }
  }

  if (staleIds.length) {
    const { error: delErr } = await admin.from("matches").delete().in("id", staleIds);
    if (delErr) {
      console.error("❌ Error borrando obsoletas:", delErr.message);
      process.exit(1);
    }
  }

  // Verificación final.
  const { data: check } = await admin
    .from("matches")
    .select("match_number, home_team, away_team, home_team_code, away_team_code")
    .eq("stage", "r32")
    .order("match_number");
  const total = check?.length ?? 0;
  const conNull = (check ?? []).filter((r) => !r.home_team_code || !r.away_team_code).length;
  console.log(`\n✅ Listo. R32: ${total} filas · sin código: ${conNull}`);
  if (total !== 16 || conNull !== 0) {
    console.error("⚠️  Revisar: se esperaban 16 filas y 0 sin código.");
  }
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
