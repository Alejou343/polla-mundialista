"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Cuando llega el kickoff, dispara router.refresh() para que el server
 * re-renderice el match con el estado bloqueado. Sin recargar la pestaña.
 */
export function AutoRefreshOnExpire({ isoTarget }: { isoTarget: string }) {
  const router = useRouter();
  useEffect(() => {
    const ms = new Date(isoTarget).getTime() - Date.now();
    if (ms <= 0) return; // ya pasó, el server ya lo manejó
    // Margen de 1.2s para asegurar que pasó el kickoff antes del refresh.
    const id = setTimeout(() => router.refresh(), ms + 1200);
    return () => clearTimeout(id);
  }, [isoTarget, router]);
  return null;
}
