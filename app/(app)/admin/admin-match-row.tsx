"use client";

import { useState, useTransition } from "react";
import type { Match } from "@/lib/types";

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
          text: `Guardado. ${json.betsRecalculated ?? 0} apuestas recalculadas.`,
        });
      }
    });
  }

  return (
    <div className="rounded-lg border border-carbon/10 bg-white p-3">
      <div className="flex items-center justify-between text-xs text-carbon/60">
        <span>
          M{match.match_number} ·{" "}
          {new Intl.DateTimeFormat("es", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(match.kickoff_time))}
        </span>
        <span>{match.status}</span>
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-2">
        <span className="truncate text-right text-sm font-medium">{match.home_team}</span>
        <input
          type="number"
          min={0}
          max={30}
          value={home}
          onChange={(e) => setHome(e.target.value)}
          className="w-14 rounded border border-carbon/20 px-2 py-1 text-center font-headline text-xl"
          inputMode="numeric"
        />
        <span className="text-carbon/40">–</span>
        <input
          type="number"
          min={0}
          max={30}
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="w-14 rounded border border-carbon/20 px-2 py-1 text-center font-headline text-xl"
          inputMode="numeric"
        />
        <span className="truncate text-sm font-medium">{match.away_team}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button onClick={save} disabled={pending} className="btn-primary px-3 py-1 text-sm">
          {pending ? "Guardando…" : "Guardar y recalcular"}
        </button>
        {msg && (
          <span className={`text-xs ${msg.ok ? "text-cesped" : "text-cancha"}`}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}
