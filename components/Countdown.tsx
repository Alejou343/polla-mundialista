"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/match-state";
import { getServerDrift, serverNow } from "@/lib/server-time";

export function Countdown({
  isoTarget,
  onExpire,
  className = "",
  prefix = "Cierra en ",
  expiredText = "Cerrado",
}: {
  isoTarget: string;
  onExpire?: () => void;
  className?: string;
  prefix?: string;
  expiredText?: string;
}) {
  const targetMs = new Date(isoTarget).getTime();
  const [drift, setDrift] = useState<number>(0);
  const [ms, setMs] = useState<number>(() => targetMs - Date.now());

  // Fetch drift una sola vez; getServerDrift cachea entre componentes.
  useEffect(() => {
    let cancelled = false;
    getServerDrift().then((d) => {
      if (!cancelled) setDrift(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Tick cada 1s usando hora del servidor.
  useEffect(() => {
    const tick = () => setMs(targetMs - serverNow(drift));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs, drift]);

  useEffect(() => {
    if (ms <= 0 && onExpire) onExpire();
  }, [ms, onExpire]);

  if (ms <= 0) {
    return (
      <span className={`tabular-nums ${className}`} aria-live="polite">
        {expiredText}
      </span>
    );
  }

  return (
    <span className={`tabular-nums ${className}`} aria-live="polite">
      {prefix}
      {formatCountdown(ms)}
    </span>
  );
}
