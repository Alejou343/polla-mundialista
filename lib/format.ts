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

const TIME_FMT = new Intl.DateTimeFormat("es", {
  hour: "2-digit",
  minute: "2-digit",
});

const FULL_FMT = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const DAY_FMT = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const DAY_SHORT_FMT = new Intl.DateTimeFormat("es", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const MONTH_YEAR_FMT = new Intl.DateTimeFormat("es", {
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
