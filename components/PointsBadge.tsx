type Tone = "filled" | "compact";

export function PointsBadge({ value, tone = "filled" }: { value: 0 | 1 | 3; tone?: Tone }) {
  const compact = tone === "compact";
  const size = compact ? "px-2 py-0 text-[10px]" : "px-2.5 py-0.5 text-xs";
  const base = `inline-flex items-center gap-1 rounded-pill font-headline uppercase tracking-[0.14em] ${size}`;
  if (value === 3) {
    return (
      <span className={`${base} border border-trophy-200/40 bg-trophy-200/20 text-trophy-200`}>
        🏆 +3 exacto
      </span>
    );
  }
  if (value === 1) {
    return (
      <span className={`${base} border border-success/30 bg-success/15 text-success-soft`}>
        ✓ +1 resultado
      </span>
    );
  }
  return (
    <span className={`${base} border border-danger/30 bg-danger/10 text-danger-soft`}>+0</span>
  );
}
