"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, Trophy, Share2, User, HelpCircle, LogOut, X, Menu } from "lucide-react";
import { Avatar } from "./Avatar";
import { signoutAction } from "@/app/(app)/actions";

type Item = {
  href: string;
  label: string;
  Icon: typeof Trophy;
  badge?: number;
};

export function MobileMenu({
  displayName,
  isAdmin,
  pendingCount,
}: {
  displayName: string;
  isAdmin: boolean;
  pendingCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const triggerOnOpen = triggerRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    const t = setTimeout(() => {
      drawerRef.current
        ?.querySelector<HTMLElement>("a, button:not([aria-label='Cerrar menú'])")
        ?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      triggerOnOpen?.focus();
    };
  }, [open]);

  const items: Item[] = [
    { href: "/matches", label: "Partidos", Icon: ListChecks, badge: pendingCount },
    { href: "/ranking", label: "Ranking", Icon: Trophy },
    { href: "/diario", label: "Compartir del día", Icon: Share2 },
    { href: "/perfil", label: "Mi perfil", Icon: User },
  ];

  function openHelp() {
    setOpen(false);
    setTimeout(() => window.dispatchEvent(new CustomEvent("polla:open-howto")), 60);
  }

  const drawer = (
    <div
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
      aria-hidden={!open}
      className={`fixed inset-0 z-[100] flex flex-col bg-stadium bg-stadium-spotlight bg-no-repeat transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "pointer-events-none translate-x-full"
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/5 bg-stadium-200/80 px-4 py-4 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={displayName} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-display text-2xl uppercase tracking-wide text-ivory">
              {displayName}
            </p>
            {isAdmin && (
              <span className="mt-1 inline-flex rounded-pill border border-trophy-200/30 bg-trophy-200/10 px-2 py-0.5 font-headline text-[10px] uppercase tracking-[0.2em] text-trophy-200">
                Admin
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-white/5 hover:text-ivory active:bg-white/10"
        >
          <X size={22} strokeWidth={2.2} aria-hidden />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-1.5">
          {items.map(({ href, label, Icon, badge }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-card px-4 py-4 text-base transition ${
                    isActive
                      ? "bg-trophy-200 text-stadium shadow-trophy"
                      : "bg-white/[0.03] text-ivory hover:bg-white/[0.07]"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center ${
                      isActive ? "text-stadium" : "text-trophy-200"
                    }`}
                    aria-hidden
                  >
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <span className="flex-1 font-headline uppercase tracking-[0.1em]">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span
                      className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-pill px-1.5 font-display text-xs leading-none ${
                        isActive ? "bg-stadium text-trophy-200" : "bg-trophy-200 text-stadium"
                      }`}
                    >
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-5 border-t border-white/5" />

        <ul className="space-y-1.5">
          <li>
            <button
              type="button"
              onClick={openHelp}
              className="flex w-full items-center gap-3 rounded-card bg-white/[0.03] px-4 py-4 text-base text-ivory transition hover:bg-white/[0.07]"
            >
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-trophy-200"
                aria-hidden
              >
                <HelpCircle size={20} />
              </span>
              <span className="flex-1 text-left font-headline uppercase tracking-[0.1em]">
                ¿Cómo se juega?
              </span>
            </button>
          </li>
          <li>
            <form action={signoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-card bg-white/[0.03] px-4 py-4 text-base text-danger-soft transition hover:bg-danger/10"
              >
                <span
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center"
                  aria-hidden
                >
                  <LogOut size={20} />
                </span>
                <span className="flex-1 text-left font-headline uppercase tracking-[0.1em]">
                  Cerrar sesión
                </span>
              </button>
            </form>
          </li>
        </ul>
      </nav>

      <footer className="border-t border-white/5 bg-stadium-200/60 px-4 py-3 text-center font-headline text-[10px] uppercase tracking-[0.22em] text-ink-muted">
        Horarios en tu hora local · Polla Familiar 26
      </footer>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={
          pendingCount > 0 ? `Abrir menú · ${pendingCount} apuestas pendientes` : "Abrir menú"
        }
        aria-expanded={open}
        aria-controls="mobile-drawer"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-ivory transition hover:bg-white/5 active:bg-white/10"
      >
        <Menu size={22} strokeWidth={2.2} aria-hidden />
        {pendingCount > 0 && (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-trophy-200 px-1 font-display text-[10px] leading-none text-stadium">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
