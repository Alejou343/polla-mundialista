/**
 * Sync manual de las ELIMINATORIAS desde openfootball (cuando el cron diario
 * se atrasa). Resuelve placeholders (W95/W96 → Argentina/Switzerland), rellena
 * códigos y winner_code, y limpia las filas placeholder obsoletas SIN dejar
 * apuestas huérfanas: repunta la apuesta al cruce resuelto (misma predicción).
 *
 * No toca grupos ni partidos ya finalizados (preserva su marcador).
 *
 * SEGURIDAD: dry-run por defecto. Ejecutar: APPLY=1 npx tsx scripts/sync-knockout.ts
 * Requiere .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
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

const APPLY = process.env.APPLY === "1";
const KNOCKOUT = ["r32", "r16", "qf", "sf", "final", "third"];

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
  const fixtures = (await fetchFixtures()).filter((m) => KNOCKOUT.includes(m.stage));

  // Estado actual para preservar marcadores ya finalizados y mapear repuntes.
  const { data: existing, error: exErr } = await admin
    .from("matches")
    .select("id, match_number, status, home_score, away_score")
    .in("stage", KNOCKOUT);
  if (exErr) {
    console.error("❌ Error leyendo eliminatorias:", exErr.message);
    process.exit(1);
  }
  const priorById = new Map((existing ?? []).map((e) => [e.id, e]));

  const rows = fixtures.map((m) => {
    const prior = priorById.get(m.id);
    const locked = prior?.status === "finished";
    return {
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
      status: locked ? "finished" : m.status,
      home_score: locked ? prior!.home_score : m.home_score,
      away_score: locked ? prior!.away_score : m.away_score,
      winner_code: m.winner_code, // siempre desde el fixture fresco
    };
  });

  const freshIds = new Set(rows.map((r) => r.id));
  const freshIdByNum = new Map(rows.map((r) => [r.match_number, r.id]));

  // Obsoletas: filas actuales que ya no existen en el JSON y no están finalizadas.
  const stale = (existing ?? []).filter((e) => !freshIds.has(e.id) && e.status !== "finished");
  const remap = new Map(stale.map((s) => [s.id, freshIdByNum.get(s.match_number)]));

  // Apuestas sobre filas obsoletas → se repuntan al cruce resuelto.
  const staleIds = stale.map((s) => s.id);
  const { data: betsOnStale } = staleIds.length
    ? await admin.from("bets").select("id, match_id").in("match_id", staleIds)
    : { data: [] as { id: string; match_id: string }[] };
  const toRepoint = betsOnStale ?? [];

  console.log(`\n📥 Upsert de ${rows.length} partidos de eliminatorias.`);
  console.log(`🗑️  Filas obsoletas a borrar: ${stale.length}`);
  stale.forEach((s) => console.log(`   ${s.id}  →  ${remap.get(s.id)}`));
  console.log(`♻️  Apuestas a repuntar: ${toRepoint.length}`);
  toRepoint.forEach((b) =>
    console.log(`   bet ${b.id}: ${b.match_id}  →  ${remap.get(b.match_id)}`),
  );

  // Muestra los cruces resueltos que cambian (placeholder → equipos reales).
  const nowResolved = rows.filter((r) => remap.size && [...remap.values()].includes(r.id));
  if (nowResolved.length) {
    console.log("\n🆕 Cruces resueltos:");
    for (const r of nowResolved) {
      console.log(`   #${r.match_number}  ${r.home_team} vs ${r.away_team}`);
    }
  }

  if (!APPLY) {
    console.log(
      "\n🔎 DRY-RUN. No se escribió nada. Ejecutar: APPLY=1 npx tsx scripts/sync-knockout.ts",
    );
    return;
  }

  const { error: upErr } = await admin.from("matches").upsert(rows, { onConflict: "id" });
  if (upErr) {
    console.error("❌ Error en upsert:", upErr.message);
    process.exit(1);
  }
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

  console.log(
    `\n✅ Listo. Upsert ${rows.length} · borradas ${stale.length} · repuntadas ${toRepoint.length}.`,
  );
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
