"use client";

import { useEffect, useRef, useState } from "react";
import { Flag } from "@/components/Flag";
import { teamDisplay } from "@/lib/teams";

const STORAGE_KEY = "copa-2026-sorteo-revelado";

// El "giro" es SOLO una animación de revelado de la pareja YA asignada por el
// sorteo (determinístico y verificable con la semilla pública): NO re-sortea nada.
// Pool de banderas para el efecto de giro (equipos confirmados → bandera real).
const POOL = [
  "Brazil",
  "Argentina",
  "France",
  "Spain",
  "England",
  "Germany",
  "Portugal",
  "Netherlands",
  "Italy",
  "Belgium",
  "Croatia",
  "Uruguay",
];

type Phase = "intro" | "spinning" | "done";

export function CopaGuideModal({ pair }: { pair: { name: string; code: string }[] }) {
  const miPareja = [pair[0].name, pair[1].name];
  const [open, setOpen] = useState(true);
  const [drawn, setDrawn] = useState(false); // ¿ya reveló su pareja antes?
  const [phase, setPhase] = useState<Phase>("intro");
  const [reels, setReels] = useState<[string, string]>([POOL[0], POOL[1]]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const intervalRef = useRef<number | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      setDrawn(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ok
    }
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  function close() {
    setOpen(false);
  }

  function sortear() {
    setPhase("spinning");
    let lock0 = false;
    let lock1 = false;
    const rnd = () => POOL[Math.floor(Math.random() * POOL.length)];

    intervalRef.current = window.setInterval(() => {
      setReels((prev) => [lock0 ? prev[0] : rnd(), lock1 ? prev[1] : rnd()]);
    }, 80);

    // Se detiene de a uno (efecto escalonado) sobre la pareja ya asignada.
    timers.current.push(
      window.setTimeout(() => {
        lock0 = true;
        setReels((prev) => [miPareja[0], prev[1]]);
      }, 1500),
    );
    timers.current.push(
      window.setTimeout(() => {
        lock1 = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        setReels([miPareja[0], miPareja[1]]);
        setPhase("done");
        try {
          localStorage.setItem(STORAGE_KEY, "1");
        } catch {
          // ok
        }
      }, 2600),
    );
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={(e) => {
        if (e.target === dialogRef.current && (drawn || phase !== "spinning")) close();
      }}
      className="w-full max-w-sm rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-carbon/50 backdrop:backdrop-blur-sm"
    >
      {drawn ? (
        <Guide onClose={close} />
      ) : (
        <Draw phase={phase} reels={reels} onSortear={sortear} onClose={close} />
      )}
    </dialog>
  );
}

// ── Experiencia de sorteo (primera vez) ──────────────────────────────────────
function Draw({
  phase,
  reels,
  onSortear,
  onClose,
}: {
  phase: Phase;
  reels: [string, string];
  onSortear: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative p-6 text-center">
      <span className="text-4xl" aria-hidden>
        🎲
      </span>
      <h2 className="mt-2 font-headline text-3xl uppercase tracking-wide text-cesped">Tu sorteo</h2>
      <p className="mt-1 text-sm text-carbon/70">
        {phase === "done" ? "¡Estos son tus 2 equipos!" : "Te tocan 2 equipos al azar"}
      </p>

      <div className="mt-6 flex items-center justify-center gap-4">
        <Slot
          team={phase === "intro" ? null : reels[0]}
          spinning={phase === "spinning"}
          settled={phase === "done"}
        />
        <span className="font-display text-2xl text-carbon/30">+</span>
        <Slot
          team={phase === "intro" ? null : reels[1]}
          spinning={phase === "spinning"}
          settled={phase === "done"}
        />
      </div>

      {phase === "intro" && (
        <button type="button" onClick={onSortear} className="btn-primary mt-7 w-full">
          🎲 Sortear mis equipos
        </button>
      )}
      {phase === "spinning" && (
        <p className="mt-7 animate-pulse font-headline text-sm uppercase tracking-[0.2em] text-cesped">
          Sorteando…
        </p>
      )}
      {phase === "done" && (
        <>
          <Burst />
          <button type="button" onClick={onClose} className="btn-primary mt-7 w-full">
            ¡Vamos! 🏆
          </button>
        </>
      )}
    </div>
  );
}

function Slot({
  team,
  spinning,
  settled,
}: {
  team: string | null;
  spinning: boolean;
  settled: boolean;
}) {
  return (
    <div
      className={`flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 bg-marfil/60 transition ${
        settled ? "scale-105 border-trophy" : spinning ? "border-cesped/40" : "border-carbon/10"
      }`}
    >
      {team ? (
        <>
          <Flag team={team} size="lg" className={spinning ? "blur-[1px]" : ""} />
          {settled && (
            <span className="font-headline text-[10px] uppercase tracking-wide text-carbon">
              {teamDisplay(team)}
            </span>
          )}
        </>
      ) : (
        <span className="font-display text-4xl text-carbon/25">?</span>
      )}
    </div>
  );
}

function Burst() {
  const emojis = ["🎉", "🏆", "⭐", "🎊", "✨"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-[-30px] text-xl"
          style={{
            left: `${(i * 67) % 100}%`,
            animation: `copa-pop ${1.8 + (i % 4) * 0.3}s ease-in ${(i % 5) * 0.12}s forwards`,
          }}
        >
          {emojis[i % emojis.length]}
        </span>
      ))}
      <style>{`
        @keyframes copa-pop {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(360px) rotate(300deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Guía normal (visitas siguientes) ─────────────────────────────────────────
function Guide({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6">
      <div className="text-center">
        <span className="text-4xl" aria-hidden>
          👑
        </span>
        <h2 className="mt-2 font-headline text-3xl uppercase tracking-wide text-cesped">
          Sorteo de campeón
        </h2>
        <p className="mt-1 text-sm text-carbon/70">Cómo leer esta pantalla</p>
      </div>

      <div className="mt-5 space-y-3 text-sm text-carbon">
        <GuideRow icon="🎲" title="El juego">
          A cada quien le tocan 2 equipos al azar. Gana quien tenga al campeón del mundo.
        </GuideRow>
        <GuideRow icon="📋" title="Tablero">
          Quién tiene qué equipos. Verde = vivo, gris tachado = eliminado, 👑 = campeón. Tu fila va
          marcada con <strong className="text-carbon">TÚ</strong>.
        </GuideRow>
        <GuideRow icon="🗺️" title="Bracket">
          El camino a la copa (al centro). Tus 2 equipos llevan ⭐ y borde dorado. Toca una bandera
          para ver el país.
        </GuideRow>
        <GuideRow icon="💰" title="El pozo">
          Se maneja por fuera de la app. Aquí solo sigues el torneo y ves quién va ganando.
        </GuideRow>
      </div>

      <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
        ¡Entendido!
      </button>
    </div>
  );
}

function GuideRow({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-marfil/70 p-3">
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-carbon/70">{children}</p>
      </div>
    </div>
  );
}
