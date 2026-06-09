"use client";

/**
 * Drift = hora_servidor − hora_cliente (ms). Positivo = cliente atrasado.
 *
 * Se calcula una sola vez por sesión de página (cache en módulo). Todos los
 * componentes que necesitan "hora del servidor en este momento" hacen:
 *
 *   const drift = await getServerDrift();
 *   const serverNow = Date.now() + drift;
 *
 * Si el endpoint /api/server-time falla, drift queda en 0 (= usar reloj
 * del cliente) — degrada con gracia, no crashea.
 */

let cachedDrift: number | null = null;
let pending: Promise<number> | null = null;

const ENDPOINT = "/api/server-time";

export async function getServerDrift(): Promise<number> {
  if (cachedDrift !== null) return cachedDrift;
  if (pending) return pending;

  pending = (async () => {
    try {
      const t0 = Date.now();
      const res = await fetch(ENDPOINT, { cache: "no-store" });
      if (!res.ok) throw new Error(`server-time ${res.status}`);
      const { iso } = (await res.json()) as { iso: string };
      const t1 = Date.now();
      const serverAtResponse = new Date(iso).getTime();
      // Compensación por latencia: asumimos viaje simétrico, mitad para ida.
      const halfRTT = (t1 - t0) / 2;
      const drift = serverAtResponse + halfRTT - t1;
      cachedDrift = drift;
      return drift;
    } catch {
      cachedDrift = 0;
      return 0;
    } finally {
      pending = null;
    }
  })();

  return pending;
}

/** Hora actual según el servidor (en ms desde epoch UTC). */
export function serverNow(drift: number): number {
  return Date.now() + drift;
}
