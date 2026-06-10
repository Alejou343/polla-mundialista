import type { Stage } from "./types";

/** "FASE DE GRUPOS · GRUPO A" / "OCTAVOS DE FINAL" / etc. */
export function stageLabel(stage: Stage, groupName: string | null): string {
  if (stage === "group") {
    return groupName ? `FASE DE GRUPOS · GRUPO ${groupName}` : "FASE DE GRUPOS";
  }
  const map: Record<Exclude<Stage, "group">, string> = {
    r32: "RONDA DE 32",
    r16: "OCTAVOS DE FINAL",
    qf: "CUARTOS DE FINAL",
    sf: "SEMIFINAL",
    third: "TERCER PUESTO",
    final: "FINAL",
  };
  return map[stage];
}

const TIME_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const FULL_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DAY_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  weekday: "long",
  day: "numeric",
  month: "long",
});

const DAY_SHORT_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  weekday: "short",
  day: "numeric",
  month: "short",
});

const MONTH_YEAR_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "long",
});

export function timeShort(iso: string): string {
  return TIME_FMT.format(new Date(iso));
}

export function dateTimeFull(iso: string): string {
  return FULL_FMT.format(new Date(iso));
}

export function dayLong(iso: string): string {
  return DAY_FMT.format(new Date(iso));
}

export function dayShort(iso: string): string {
  return DAY_SHORT_FMT.format(new Date(iso));
}

export function monthYear(iso: string): string {
  return MONTH_YEAR_FMT.format(new Date(iso));
}

/**
 * TZ del usuario final: Colombia (UTC-5). Todos los horarios visibles —
 * agrupación por día, horas de inicio, countdowns — se expresan en esta TZ
 * para que la familia vea lo mismo sin importar dónde esté.
 */
export const TOURNAMENT_TZ = "America/Bogota";

const TOURNAMENT_DAY_KEY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: TOURNAMENT_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const TOURNAMENT_DAY_LONG_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: TOURNAMENT_TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Día del torneo en formato YYYY-MM-DD (sortable, estable). */
export function tournamentDayKey(iso: string): string {
  return TOURNAMENT_DAY_KEY_FMT.format(new Date(iso));
}

/** Día del torneo en español: "jueves, 11 de junio". */
export function tournamentDayLong(iso: string): string {
  return TOURNAMENT_DAY_LONG_FMT.format(new Date(iso));
}
