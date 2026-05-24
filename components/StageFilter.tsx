import Link from "next/link";
import type { Stage } from "@/lib/types";

const STAGE_TABS: Array<{ value: Stage | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "group", label: "Grupos" },
  { value: "r32", label: "1/16" },
  { value: "r16", label: "Octavos" },
  { value: "qf", label: "Cuartos" },
  { value: "sf", label: "Semis" },
  { value: "third", label: "3er" },
  { value: "final", label: "Final" },
];

export type MatchView = "all" | "pending" | "played";

export function StageFilter({
  activeStage,
  activeView,
  pendingCount,
}: {
  activeStage: Stage | "all";
  activeView: MatchView;
  pendingCount: number;
}) {
  function hrefFor(view: MatchView, stage?: Stage | "all"): string {
    const params = new URLSearchParams();
    if (stage && stage !== "all") params.set("stage", stage);
    if (view !== "all") params.set("view", view);
    const qs = params.toString();
    return qs ? `/matches?${qs}` : "/matches";
  }

  const viewTabs: Array<{ value: MatchView; label: string; tone?: string }> = [
    { value: "all", label: "Todos" },
    {
      value: "pending",
      label: pendingCount > 0 ? `⚡ Pendientes (${pendingCount})` : "⚡ Pendientes",
      tone: "cancha",
    },
    { value: "played", label: "Ya jugados" },
  ];

  return (
    <div className="space-y-2">
      {/* Vista: todos / pendientes / jugados */}
      <nav className="overflow-x-auto" aria-label="Filtrar partidos por estado">
        <ul className="flex gap-2">
          {viewTabs.map((t) => {
            const isActive = activeView === t.value;
            const inactiveCls =
              t.tone === "cancha"
                ? "bg-white text-cancha ring-1 ring-cancha/30 hover:bg-cancha/5"
                : "bg-white text-carbon hover:bg-carbon/5";
            const activeCls =
              t.tone === "cancha"
                ? "bg-cancha text-white shadow-sm"
                : "bg-carbon text-white shadow-sm";
            return (
              <li key={t.value}>
                <Link
                  href={hrefFor(t.value, activeStage)}
                  className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive ? activeCls : inactiveCls
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Etapa */}
      <nav className="overflow-x-auto pb-1" aria-label="Filtrar por etapa del torneo">
        <ul className="flex gap-2">
          {STAGE_TABS.map((t) => {
            const isActive = activeStage === t.value;
            return (
              <li key={t.value}>
                <Link
                  href={hrefFor(activeView, t.value)}
                  className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs transition ${
                    isActive
                      ? "bg-cesped text-white shadow-sm"
                      : "bg-white text-carbon/70 hover:bg-carbon/5"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
