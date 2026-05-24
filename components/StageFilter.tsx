import Link from "next/link";
import type { Stage } from "@/lib/types";

const TABS: Array<{ value: Stage | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "group", label: "Grupos" },
  { value: "r32", label: "1/16" },
  { value: "r16", label: "Octavos" },
  { value: "qf", label: "Cuartos" },
  { value: "sf", label: "Semis" },
  { value: "third", label: "3er" },
  { value: "final", label: "Final" },
];

export function StageFilter({ active }: { active: Stage | "all" }) {
  return (
    <nav className="-mx-4 overflow-x-auto px-4 pb-1">
      <ul className="flex gap-2">
        {TABS.map((t) => {
          const isActive = active === t.value;
          const href = t.value === "all" ? "/matches" : `/matches?stage=${t.value}`;
          return (
            <li key={t.value}>
              <Link
                href={href}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-sm transition ${
                  isActive ? "bg-cesped text-white" : "bg-white text-carbon hover:bg-cesped/10"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
