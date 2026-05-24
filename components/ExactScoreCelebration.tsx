"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number; // 0 → 1, muere al llegar a 0
  decay: number;
  rot: number;
  rotSpeed: number;
};

const COLORS = [
  "#F4C430", // trofeo
  "#0E7C3A", // cesped
  "#1E88E5", // cielo
  "#D32F2F", // cancha
  "#ffffff",
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function buildParticles(count: number, canvasW: number, canvasH: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: canvasW / 2,
    y: canvasH / 2,
    vx: randomBetween(-6, 6),
    vy: randomBetween(-12, -2),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomBetween(6, 14),
    life: 1,
    decay: randomBetween(0.012, 0.025),
    rot: randomBetween(0, Math.PI * 2),
    rotSpeed: randomBetween(-0.15, 0.15),
  }));
}

export function ExactScoreCelebration({ matchId }: { matchId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [visible, setVisible] = useState(true);
  const [msgVisible, setMsgVisible] = useState(true);

  // Clave de localStorage para no repetir la celebración
  const storageKey = `polla-celebrated-${matchId}`;

  useEffect(() => {
    // Si ya se celebró este partido, no hacer nada
    if (typeof window !== "undefined" && localStorage.getItem(storageKey) === "1") {
      setVisible(false);
      setMsgVisible(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.offsetWidth || 320;
    const H = canvas.offsetHeight || 200;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = buildParticles(30, W, H);

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let allDead = true;
      for (const p of particles) {
        if (p.life <= 0) continue;
        allDead = false;

        p.x += p.vx;
        p.vy += 0.35; // gravedad
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.life -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (!allDead) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        // Animación terminada: marcar en localStorage y ocultar canvas
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, "1");
        }
        setVisible(false);
      }
    }

    rafRef.current = requestAnimationFrame(draw);

    // El mensaje desaparece a los 2.5 s
    const msgTimer = setTimeout(() => setMsgVisible(false), 2500);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(msgTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible && !msgVisible) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Canvas de confetti — ocupa toda la pantalla */}
      {visible && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />}

      {/* Mensaje flotante con fade-out */}
      {msgVisible && (
        <div
          className={`relative rounded-2xl bg-trofeo px-6 py-4 text-center shadow-xl transition-opacity duration-700 ${
            msgVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ animation: "polla-fadeout 2.5s ease forwards" }}
        >
          <p className="font-headline text-2xl uppercase tracking-widest text-carbon">
            🏆 ¡Marcador exacto!
          </p>
          <p className="mt-1 font-body text-sm font-semibold text-carbon">+3 puntos para vos</p>
        </div>
      )}

      <style>{`
        @keyframes polla-fadeout {
          0%   { opacity: 1; transform: scale(1); }
          70%  { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
