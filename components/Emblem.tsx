import Link from "next/link";

const REMOTE_LOGO = "https://mundial.hes-abo.com/assets/fwc-logo-04d254fa.webp";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { wrap: string; img: string; text: string }> = {
  sm: { wrap: "h-8", img: "h-8 w-8", text: "text-base" },
  md: { wrap: "h-10", img: "h-10 w-10", text: "text-lg" },
  lg: { wrap: "h-14", img: "h-14 w-14", text: "text-2xl" },
  xl: { wrap: "h-20", img: "h-20 w-20", text: "text-4xl" },
};

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={REMOTE_LOGO}
        alt="Polla Familiar 26"
        className={`${s.img} object-contain drop-shadow-[0_0_18px_rgba(250,204,21,0.35)]`}
      />
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
