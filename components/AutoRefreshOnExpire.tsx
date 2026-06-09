"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getServerDrift, serverNow } from "@/lib/server-time";

/**
 * Cuando llega el kickoff (según reloj del servidor, no del cliente),
 * dispara router.refresh() para que la página re-renderice con el match
 * en estado bloqueado. Si el cliente tiene su reloj alterado, igualmente
 * el refresh se programa con la hora autoritativa.
 */
export function AutoRefreshOnExpire({ isoTarget }: { isoTarget: string }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    getServerDrift().then((drift) => {
      if (cancelled) return;
      const target = new Date(isoTarget).getTime();
      const msUntil = target - serverNow(drift);
      if (msUntil <= 0) {
        router.refresh();
        return;
      }
      // +1.2s de margen para que el servidor ya vea el kickoff como pasado.
      timer = setTimeout(() => router.refresh(), msUntil + 1200);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isoTarget, router]);

  return null;
}
