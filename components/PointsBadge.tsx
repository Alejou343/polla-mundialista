type Tone = "filled" | "compact";

export function PointsBadge({ value, tone = "filled" }: { value: 0 | 1 | 3; tone?: Tone }) {
  const compact = tone === "compact";
  if (value === 3) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-trofeo/40 font-semibold text-carbon ${
          compact ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"
        }`}
      >
        🏆 +3 exacto
      </span>
    );
  }
  if (value === 1) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-cesped/20 font-semibold text-cesped ${
          compact ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"
        }`}
      >
        ✓ +1 resultado
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-full bg-cancha/10 font-semibold text-cancha ${
        compact ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      +0
    </span>
  );
}
