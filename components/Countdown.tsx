"use client";

import { useEffect, useState } from "react";
import { formatCountdown, msUntilKickoff } from "@/lib/match-state";

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
  const [ms, setMs] = useState(() => msUntilKickoff(isoTarget));

  useEffect(() => {
    const tick = () => setMs(msUntilKickoff(isoTarget));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isoTarget]);

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
