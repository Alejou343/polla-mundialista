"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

/**
 * Control exclusivo de admin para fijar/corregir el marcador de un partido
 * directamente desde su vista de detalle. Reemplaza al viejo panel /admin:
 * el admin entra al partido y puntúa en contexto.
 *
 * Pega contra `PATCH /api/admin/match/[id]`, que valida is_admin server-side
 * y recalcula los puntos de todas las apuestas desde cero (idempotente).
 */
export function AdminScorePanel({
  matchId,
  initialHome,
  initialAway,
  homeShort,
  awayShort,
  alreadyScored,
}: {
  matchId: string;
  initialHome: number | null;
  initialAway: number | null;
  homeShort: string;
  awayShort: string;
  alreadyScored: boolean;
}) {
  const router = useRouter();
  const [home, setHome] = useState<string>(initialHome?.toString() ?? "");
  const [away, setAway] = useState<string>(initialAway?.toString() ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    const h = Number(home);
    const a = Number(away);
    if (!Number.isInteger(h) || !Number.isInteger(a) || h < 0 || a < 0 || h > 30 || a > 30) {
      setMsg({ ok: false, text: "Marcadores entre 0 y 30." });
      return;
    }
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/match/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_score: h, away_score: a }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: json.error ?? `Error ${res.status}` });
        return;
      }
      setMsg({
        ok: true,
        text: `Guardado · ${json.betsRecalculated ?? 0} puntuaciones recalculadas`,
      });
      // Refresca el server component para que el hero muestre el marcador nuevo.
      router.refresh();
    });
  }

  return (
    <section className="mt-6 overflow-hidden rounded-card border border-trophy-200/30 bg-trophy-200/[0.06] p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="kicker text-trophy-200">⚙️ Zona admin · Resultado</h2>
        <span className="font-headline text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          {alreadyScored ? "Corregir" : "Sin puntuar"}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        Fija el marcador al minuto 90. Al guardar se recalculan los puntos de todas las apuestas.
      </p>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <label className="flex flex-col items-center gap-1">
          <span className="font-headline text-[11px] uppercase tracking-wide text-ivory">
            {homeShort}
          </span>
          <input
            type="number"
            min={0}
            max={30}
            value={home}
            onChange={(e) => setHome(e.target.value)}
            inputMode="numeric"
            aria-label={`Marcador ${homeShort}`}
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-2 text-center font-display text-4xl tabular-nums text-trophy-200 focus:border-trophy-200 focus:outline-none focus:ring-2 focus:ring-trophy-200/30"
          />
        </label>
        <span className="pt-5 text-2xl text-ink-muted/40">–</span>
        <label className="flex flex-col items-center gap-1">
          <span className="font-headline text-[11px] uppercase tracking-wide text-ivory">
            {awayShort}
          </span>
          <input
            type="number"
            min={0}
            max={30}
            value={away}
            onChange={(e) => setAway(e.target.value)}
            inputMode="numeric"
            aria-label={`Marcador ${awayShort}`}
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-2 text-center font-display text-4xl tabular-nums text-trophy-200 focus:border-trophy-200 focus:outline-none focus:ring-2 focus:ring-trophy-200/30"
          />
        </label>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        {msg ? (
          <span
            className={`truncate text-[11px] ${msg.ok ? "text-success-soft" : "text-danger-soft"}`}
          >
            {msg.ok ? "✓" : "✗"} {msg.text}
          </span>
        ) : (
          <span className="text-[11px] text-ink-muted">
            {alreadyScored ? "Resultado guardado" : "Aún sin resultado"}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          aria-busy={pending}
          className="inline-flex items-center gap-1.5 rounded-pill border border-trophy-200/40 bg-trophy-200/10 px-4 py-2 font-headline text-[11px] uppercase tracking-[0.14em] text-trophy-200 transition hover:bg-trophy-200/20 disabled:opacity-60"
        >
          Guardar y recalcular
        </button>
      </div>

      {pending && <Loader fullscreen size="lg" label="Guardando resultado" />}
    </section>
  );
}
