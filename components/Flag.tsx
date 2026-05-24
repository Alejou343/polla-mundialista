import { isConfirmedTeam, teamCode } from "@/lib/teams";

const FLAG_BASE = "https://flagcdn.com";

// Equipos FIFA que NO tienen código ISO-3166-alpha-2 propio.
// flagcdn soporta subdivisiones GB-* para Inglaterra / Escocia / Gales.
const FLAG_OVERRIDES: Record<string, string> = {
  England: "gb-eng",
  Scotland: "gb-sct",
};

const SIZES = {
  sm: { h: 18, w: 24, cdn: 40 },
  md: { h: 28, w: 38, cdn: 80 },
  lg: { h: 40, w: 54, cdn: 80 },
  xl: { h: 56, w: 76, cdn: 160 },
} as const;

type Size = keyof typeof SIZES;

function flagSlug(team: string): string | null {
  if (!isConfirmedTeam(team)) return null;
  if (FLAG_OVERRIDES[team]) return FLAG_OVERRIDES[team];
  return teamCode(team).toLowerCase();
}

/**
 * Bandera del equipo desde flagcdn.com (SVG, gratis, sin API key).
 * Si el equipo es un placeholder de knockout (ej. "2A", "W101") muestra
 * un cuadro neutro con el código corto.
 */
export function Flag({
  team,
  size = "md",
  className = "",
}: {
  team: string;
  size?: Size;
  className?: string;
}) {
  const slug = flagSlug(team);
  const { h, w } = SIZES[size];

  if (!slug) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-carbon/10 font-headline tabular-nums text-carbon/45 ring-1 ring-carbon/10 ${className}`}
        style={{ width: w, height: h, fontSize: Math.max(10, h * 0.5) }}
        aria-label={team}
      >
        {teamCode(team)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${FLAG_BASE}/${slug}.svg`}
      alt={`Bandera de ${team}`}
      width={w}
      height={h}
      loading="lazy"
      className={`inline-block shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-carbon/10 ${className}`}
    />
  );
}
