"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "./Avatar";

export function NavPill({
  href,
  children,
  avatarName,
}: {
  href: string;
  children: React.ReactNode;
  avatarName?: string;
}) {
  const pathname = usePathname();
  // / coincide solo exacto; el resto con startsWith para que /matches/[id] active "Partidos".
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  const base =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition";
  const state = isActive ? "bg-carbon text-white" : "text-carbon hover:bg-carbon/5";

  return (
    <Link href={href} className={`${base} ${state}`}>
      {avatarName && <Avatar name={avatarName} size="xs" />}
      {children}
    </Link>
  );
}
