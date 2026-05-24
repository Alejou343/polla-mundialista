"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "./Avatar";
import { signoutAction } from "@/app/(app)/actions";

type Item = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  tone?: "default" | "admin";
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
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Cerrar al navegar a otra ruta.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquear scroll del body, cerrar con Escape, foco al primer link.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Snapshot del trigger en el momento del effect para devolverle foco en el cleanup.
    const triggerOnOpen = triggerRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    // Foco al primer link tras abrir.
    const t = setTimeout(() => {
      const first = drawerRef.current?.querySelector<HTMLElement>("a, button");
      first?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      triggerOnOpen?.focus();
    };
  }, [open]);

  const items: Item[] = [
    { href: "/matches", label: "Partidos", icon: "⚽", badge: pendingCount },
    { href: "/ranking", label: "Ranking", icon: "🏆" },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Panel admin",
            icon: "🛠️",
            tone: "admin" as const,
          },
        ]
      : []),
    { href: "/perfil", label: "Mi perfil", icon: "👤" },
  ];

  function openHelp() {
    setOpen(false);
    // Dejar que cierre el drawer antes de abrir el modal.
    setTimeout(() => window.dispatchEvent(new CustomEvent("polla:open-howto")), 60);
  }

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
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-carbon transition hover:bg-carbon/5 active:bg-carbon/10"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        {pendingCount > 0 && (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cancha px-1 text-[10px] font-bold leading-none text-white">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </button>

      {/* Backdrop + drawer */}
      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className="absolute inset-0 cursor-default bg-carbon/50 backdrop-blur-sm"
        />

        <aside
          id="mobile-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className={`absolute inset-y-0 right-0 flex w-80 max-w-[88vw] flex-col bg-marfil shadow-2xl transition-transform duration-200 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header del drawer: avatar + nombre + tag admin + close */}
          <div className="flex items-start justify-between gap-2 border-b border-carbon/10 bg-white p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={displayName} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-headline text-lg uppercase tracking-wide text-carbon">
                  {displayName}
                </p>
                {isAdmin && (
                  <span className="mt-0.5 inline-flex rounded-full bg-cancha/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cancha">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-carbon/70 transition hover:bg-carbon/5"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base transition ${
                        isActive ? "bg-carbon text-white" : "text-carbon hover:bg-carbon/5"
                      }`}
                    >
                      <span
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-xl"
                        aria-hidden
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold leading-none ${
                            isActive ? "bg-white text-carbon" : "bg-cancha text-white"
                          }`}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="my-3 border-t border-carbon/10" />

            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={openHelp}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-base text-carbon transition hover:bg-carbon/5"
                >
                  <span
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-xl"
                    aria-hidden
                  >
                    ❓
                  </span>
                  <span className="flex-1 text-left font-medium">¿Cómo se juega?</span>
                </button>
              </li>
              <li>
                <form action={signoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-base text-cancha transition hover:bg-cancha/5"
                  >
                    <span
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-xl"
                      aria-hidden
                    >
                      🚪
                    </span>
                    <span className="flex-1 text-left font-medium">Cerrar sesión</span>
                  </button>
                </form>
              </li>
            </ul>
          </nav>

          <footer className="border-t border-carbon/10 px-4 py-3 text-center text-[11px] text-carbon/55">
            🕒 Horarios en hora de Colombia
          </footer>
        </aside>
      </div>
    </>
  );
}
