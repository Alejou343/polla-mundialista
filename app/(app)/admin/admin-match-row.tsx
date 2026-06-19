"use client";

import { useState, useTransition } from "react";
import type { Match } from "@/lib/types";
import { teamDisplay } from "@/lib/teams";
import { stageLabel } from "@/lib/format";
import { LocalTime } from "@/components/LocalTime";
import { Flag } from "@/components/Flag";
import Loader from "@/components/Loader";

export function AdminMatchRow({ match }: { match: Match }) {
  const [home, setHome] = useState<string>(match.home_score?.toString() ?? "");
  const [away, setAway] = useState<string>(match.away_score?.toString() ?? "");
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
      const res = await fetch(`/api/admin/match/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home_score: h, away_score: a }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: json.error ?? `Error ${res.status}` });
      } else {
        setMsg({
          ok: true,
          text: `Guardado · ${json.betsRecalculated ?? 0} puntuaciones recalculadas`,
        });
      }
    });
  }

  return (
    <div className="surface-card p-3">
      <div className="flex items-center justify-between gap-2 font-headline text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        <span className="truncate">{stageLabel(match.stage, match.group_name)}</span>
        <span className="whitespace-nowrap">
          <LocalTime iso={match.kickoff_time} mode="time" /> ·{" "}
          <LocalTime iso={match.kickoff_time} mode="dayShort" />
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2">
        <span className="flex items-center justify-end gap-1.5">
          <span className="block min-w-0 truncate text-right font-headline text-[11px] uppercase tracking-wide text-ivory">
            {teamDisplay(match.home_team)}
          </span>
          <Flag team={match.home_team} size="sm" />
        </span>
        <input
          type="number"
          min={0}
          max={30}
          value={home}
          onChange={(e) => setHome(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-center font-display text-2xl tabular-nums text-trophy-200 focus:border-trophy-200 focus:outline-none focus:ring-2 focus:ring-trophy-200/30"
          inputMode="numeric"
          aria-label={`Marcador ${teamDisplay(match.home_team)}`}
        />
        <span className="text-ink-muted/40">–</span>
        <input
          type="number"
          min={0}
          max={30}
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-center font-display text-2xl tabular-nums text-trophy-200 focus:border-trophy-200 focus:outline-none focus:ring-2 focus:ring-trophy-200/30"
          inputMode="numeric"
          aria-label={`Marcador ${teamDisplay(match.away_team)}`}
        />
        <span className="flex items-center gap-1.5">
          <Flag team={match.away_team} size="sm" />
          <span className="block min-w-0 truncate font-headline text-[11px] uppercase tracking-wide text-ivory">
            {teamDisplay(match.away_team)}
          </span>
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {msg ? (
          <span
            className={`truncate text-[11px] ${msg.ok ? "text-success-soft" : "text-danger-soft"}`}
          >
            {msg.ok ? "✓" : "✗"} {msg.text}
          </span>
        ) : (
          <span className="text-[11px] text-ink-muted">
            {match.status === "finished" ? "Resultado guardado" : "Sin resultado"}
          </span>
        )}
        <button
          onClick={save}
          disabled={pending}
          aria-busy={pending}
          className="inline-flex items-center gap-1.5 rounded-pill border border-trophy-200/40 bg-trophy-200/10 px-3 py-1.5 font-headline text-[11px] uppercase tracking-[0.14em] text-trophy-200 transition hover:bg-trophy-200/20 disabled:opacity-60"
        >
          Guardar y recalcular
        </button>
        {pending && <Loader fullscreen size="lg" label="Guardando resultado" />}
      </div>
    </div>
  );
}
