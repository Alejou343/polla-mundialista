"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, ListChecks, Share2, User } from "lucide-react";

type Item = {
  href: string;
  label: string;
  Icon: typeof Trophy;
  badge?: number;
};

export function BottomNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  const items: Item[] = [
    { href: "/matches", label: "Partidos", Icon: ListChecks, badge: pendingCount },
    { href: "/ranking", label: "Ranking", Icon: Trophy },
    { href: "/diario", label: "Diario", Icon: Share2 },
    { href: "/perfil", label: "Perfil", Icon: User },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/10 bg-stadium/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      {items.map(({ href, label, Icon, badge }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex h-14 flex-col items-center justify-center gap-0.5 transition ${
              active ? "text-trophy-200" : "text-ink-muted hover:text-ivory"
            }`}
          >
            <span className="relative inline-flex">
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-trophy-200 px-1 text-[10px] font-bold leading-none text-stadium">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </span>
            <span className="font-headline text-[10px] uppercase tracking-[0.18em]">{label}</span>
            {active && (
              <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-trophy-200" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
