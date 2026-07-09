"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function SyncButton() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function sync() {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ ok: false, text: json.error ?? `Error ${res.status}` });
        return;
      }
      const parts: string[] = [];
      if (json.resolved) parts.push(`${json.resolved} cruces resueltos`);
      if (json.scored) parts.push(`${json.scored} partidos puntuados`);
      if (json.recalculated) parts.push(`${json.recalculated} apuestas`);
      setMsg({ ok: true, text: parts.length ? parts.join(" · ") : "Todo al día, sin cambios" });
      router.refresh();
    });
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={sync}
        disabled={pending}
        aria-busy={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-card border border-trophy-200/40 bg-trophy-200/10 px-4 py-2.5 font-headline text-xs uppercase tracking-[0.14em] text-trophy-200 transition hover:bg-trophy-200/20 disabled:opacity-60"
      >
        <RefreshCw
          size={15}
          strokeWidth={2.2}
          className={pending ? "animate-spin" : ""}
          aria-hidden
        />
        {pending ? "Sincronizando…" : "Sincronizar ahora"}
      </button>
      {msg && (
        <p
          className={`mt-2 text-center text-[11px] ${msg.ok ? "text-success-soft" : "text-danger-soft"}`}
        >
          {msg.ok ? "✓" : "✗"} {msg.text}
        </p>
      )}
    </div>
  );
}
