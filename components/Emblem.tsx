import Link from "next/link";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { wrap: string; img: string; text: string }> = {
  sm: { wrap: "h-8", img: "h-8 w-8", text: "text-base" },
  md: { wrap: "h-10", img: "h-10 w-10", text: "text-lg" },
  lg: { wrap: "h-14", img: "h-14 w-14", text: "text-2xl" },
  xl: { wrap: "h-20", img: "h-20 w-20", text: "text-4xl" },
};

function BallMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Polla Familiar 26" className={className}>
      <defs>
        <radialGradient id="emblem-ball" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="55%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <radialGradient id="emblem-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#emblem-glow)" />
      <g transform="translate(32 32)">
        <circle r="22" fill="url(#emblem-ball)" stroke="#0d1117" strokeWidth="1.5" />
        <g fill="#0d1117">
          <polygon points="0,-8 8,-2.5 5,7 -5,7 -8,-2.5" />
          <polygon points="0,-8 -8,-2.5 -14,-8 -10,-18 -1,-19" />
          <polygon points="0,-8 8,-2.5 14,-8 10,-18 1,-19" />
          <polygon points="-5,7 -11,14 -19,10 -17,1 -8,-2.5" />
          <polygon points="5,7 11,14 19,10 17,1 8,-2.5" />
          <polygon points="-5,7 0,17 5,7 5,13 -5,13" />
        </g>
        <ellipse cx="-7" cy="-9" rx="6" ry="3" fill="#ffffff" opacity="0.32" />
      </g>
    </svg>
  );
}

export function Emblem({
  size = "md",
  withWordmark = true,
  href,
  className = "",
}: {
  size?: Size;
  withWordmark?: boolean;
  href?: string;
  className?: string;
}) {
  const s = sizeMap[size];
  const content = (
    <span className={`flex items-center gap-2.5 ${s.wrap} ${className}`}>
      <BallMark className={`${s.img} drop-shadow-[0_0_18px_rgba(250,204,21,0.35)]`} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className={`font-display ${s.text} uppercase tracking-[0.06em] text-trophy-200`}>
            Polla Familiar
          </span>
          <span className="font-headline text-[10px] uppercase tracking-[0.32em] text-ink-muted">
            Mundial 26
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        {content}
      </Link>
    );
  }
  return content;
}
