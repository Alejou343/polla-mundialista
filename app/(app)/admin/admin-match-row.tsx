"use client";

import { useState, useTransition } from "react";
import type { Match } from "@/lib/types";
import { teamDisplay } from "@/lib/teams";
import { stageLabel, timeShort, dayShort } from "@/lib/format";
import { Flag } from "@/components/Flag";

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
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-carbon/55">
        <span className="truncate">{stageLabel(match.stage, match.group_name)}</span>
        <span className="whitespace-nowrap text-carbon/55">
          {timeShort(match.kickoff_time)} · {dayShort(match.kickoff_time)}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2">
        <span className="flex items-center justify-end gap-1.5">
          <span className="block min-w-0 truncate text-right text-[11px] text-carbon/80">
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
          className="w-full rounded-md border border-carbon/15 bg-marfil px-2 py-1.5 text-center font-headline text-2xl tabular-nums focus:border-cesped focus:outline-none focus:ring-2 focus:ring-cesped/30"
          inputMode="numeric"
          aria-label={`Marcador ${teamDisplay(match.home_team)}`}
        />
        <span className="text-carbon/40">–</span>
        <input
          type="number"
          min={0}
          max={30}
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="w-full rounded-md border border-carbon/15 bg-marfil px-2 py-1.5 text-center font-headline text-2xl tabular-nums focus:border-cesped focus:outline-none focus:ring-2 focus:ring-cesped/30"
          inputMode="numeric"
          aria-label={`Marcador ${teamDisplay(match.away_team)}`}
        />
        <span className="flex items-center gap-1.5">
          <Flag team={match.away_team} size="sm" />
          <span className="block min-w-0 truncate text-[11px] text-carbon/80">
            {teamDisplay(match.away_team)}
          </span>
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {msg ? (
          <span className={`truncate text-[11px] ${msg.ok ? "text-cesped" : "text-cancha"}`}>
            {msg.ok ? "✓" : "✗"} {msg.text}
          </span>
        ) : (
          <span className="text-[11px] text-carbon/55">
            {match.status === "finished" ? "Resultado guardado" : "Sin resultado"}
          </span>
        )}
        <button
          onClick={save}
          disabled={pending}
          className="rounded-md bg-carbon px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar y recalcular"}
        </button>
      </div>
    </div>
  );
}
