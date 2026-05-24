"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "./Avatar";

export function NavPill({
  href,
  children,
  avatarName,
  badge,
}: {
  href: string;
  children: React.ReactNode;
  avatarName?: string;
  /** Si > 0, muestra un contador rojo (p.ej. apuestas pendientes). */
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  const base =
    "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition";
  const state = isActive ? "bg-carbon text-white" : "text-carbon hover:bg-carbon/5";

  return (
    <Link href={href} className={`${base} ${state}`}>
      {avatarName && <Avatar name={avatarName} size="xs" />}
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cancha px-1 text-[11px] font-bold leading-none text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
