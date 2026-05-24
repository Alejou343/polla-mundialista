type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, string> = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

function initials(name: string): string {
  const clean = name.trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-cesped font-semibold text-white ${sizeMap[size]} ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
