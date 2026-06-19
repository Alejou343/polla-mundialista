"use client";

import { useEffect, useState } from "react";
import { dateTimeFull, dayLong, dayShort, monthYear, timeShort } from "@/lib/format";

export type LocalTimeMode = "time" | "dayShort" | "dayLong" | "full" | "monthYear";

const SERVER_FALLBACK: Record<LocalTimeMode, (iso: string) => string> = {
  time: timeShort,
  dayShort,
  dayLong,
  full: dateTimeFull,
  monthYear,
};

const OPTIONS: Record<LocalTimeMode, Intl.DateTimeFormatOptions> = {
  time: { hour: "2-digit", minute: "2-digit", hour12: false },
  dayShort: { weekday: "short", day: "numeric", month: "short" },
  dayLong: { weekday: "long", day: "numeric", month: "long" },
  full: {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
  monthYear: { year: "numeric", month: "long" },
};

/**
 * Renderiza una fecha/hora en la TZ del navegador del usuario.
 *
 * - SSR: usa hora Colombia (fallback estable).
 * - Cliente: en useEffect detecta la TZ del navegador y re-formatea.
 *
 * Lock/RLS/countdowns siguen UTC en el servidor — esto es solo display.
 */
export function LocalTime({
  iso,
  mode = "time",
  className = "",
}: {
  iso: string;
  mode?: LocalTimeMode;
  className?: string;
}) {
  const [text, setText] = useState(() => SERVER_FALLBACK[mode](iso));

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const fmt = new Intl.DateTimeFormat("es", { timeZone: tz, ...OPTIONS[mode] });
      setText(fmt.format(new Date(iso)));
    } catch {
      // Si Intl falla por algún motivo, mantenemos el fallback de Bogotá.
    }
  }, [iso, mode]);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}
