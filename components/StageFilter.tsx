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

  const viewTabs: Array<{ value: MatchView; label: string; urgent?: boolean }> = [
    { value: "all", label: "Todos" },
    {
      value: "pending",
      label: pendingCount > 0 ? `⚡ Pendientes · ${pendingCount}` : "⚡ Pendientes",
      urgent: true,
    },
    { value: "played", label: "Ya jugados" },
  ];

  return (
    <div className="space-y-3">
      <nav aria-label="Filtrar partidos por estado">
        <ul className="flex gap-1 rounded-pill border border-white/10 bg-white/5 p-1">
          {viewTabs.map((t) => {
            const isActive = activeView === t.value;
            const activeCls = t.urgent
              ? "bg-trophy-200 text-stadium shadow-trophy"
              : "bg-trophy-200 text-stadium shadow-trophy";
            const inactiveCls = t.urgent
              ? "text-warning-soft hover:text-trophy-200"
              : "text-ink-muted hover:text-ivory";
            return (
              <li key={t.value} className="flex-1">
                <Link
                  href={hrefFor(t.value, activeStage)}
                  className={`flex w-full items-center justify-center rounded-pill px-3 py-1.5 font-headline text-xs uppercase tracking-[0.14em] transition ${
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

      <nav className="overflow-x-auto pb-1" aria-label="Filtrar por etapa del torneo">
        <ul className="flex gap-1.5">
          {STAGE_TABS.map((t) => {
            const isActive = activeStage === t.value;
            return (
              <li key={t.value}>
                <Link
                  href={hrefFor(activeView, t.value)}
                  className={`inline-flex whitespace-nowrap rounded-pill px-3 py-1 font-headline text-[11px] uppercase tracking-[0.16em] transition ${
                    isActive
                      ? "bg-pitch-700 text-trophy-200 ring-1 ring-trophy-200/30"
                      : "border border-white/10 bg-white/[0.03] text-ink-muted hover:text-ivory"
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
