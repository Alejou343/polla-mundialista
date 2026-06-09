"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "polla-2026-seen-howto";

export function HowToPlayModal({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Apertura automática solo la primera vez (persistido en localStorage).
  useEffect(() => {
    if (initialOpen) return;
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setOpen(true);
      }
    } catch {
      // ok
    }
  }, [initialOpen]);

  // Escuchar evento global para abrir desde el botón del nav.
  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("polla:open-howto", onOpen);
    return () => window.removeEventListener("polla:open-howto", onOpen);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ok
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={close}
      onClick={(e) => {
        // cerrar al click en backdrop
        if (e.target === dialogRef.current) close();
      }}
      className="w-full max-w-sm rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-carbon/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="text-center">
          <span className="text-4xl" aria-hidden>
            ⚽
          </span>
          <h2 className="mt-2 font-headline text-3xl uppercase tracking-wide text-cesped">
            ¿Cómo se juega?
          </h2>
          <p className="mt-1 text-sm text-carbon/70">Polla Familiar Mundial 2026</p>
        </div>

        <div className="mt-5 space-y-3 text-sm text-carbon">
          <div className="flex items-start gap-3 rounded-lg bg-marfil/70 p-3">
            <span className="text-xl" aria-hidden>
              📅
            </span>
            <div>
              <p className="font-semibold">Predice cada partido</p>
              <p className="text-xs text-carbon/70">
                Antes de que empiece, escribe cuántos goles harán los dos equipos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-marfil/70 p-3">
            <span className="text-xl" aria-hidden>
              🏆
            </span>
            <div>
              <p className="font-semibold">Suma puntos</p>
              <ul className="mt-1 space-y-0.5 text-xs text-carbon/70">
                <li>
                  • <strong className="text-carbon">3 pts</strong> si aciertas el marcador exacto
                </li>
                <li>
                  • <strong className="text-carbon">1 pt</strong> si solo aciertas quién gana (o
                  empate)
                </li>
                <li>• 0 pts si fallas</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-marfil/70 p-3">
            <span className="text-xl" aria-hidden>
              🔒
            </span>
            <div>
              <p className="font-semibold">Cierre al pitazo inicial</p>
              <p className="text-xs text-carbon/70">
                Cuando empieza el partido, ya no se puede tocar la apuesta. Apuesta a tiempo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-marfil/70 p-3">
            <span className="text-xl" aria-hidden>
              🕒
            </span>
            <div>
              <p className="font-semibold">Hora de Colombia (UTC−5)</p>
              <p className="text-xs text-carbon/70">
                Todos los horarios se calculan con el reloj del servidor — no importa en qué país
                estés ni qué hora marque tu celular.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-marfil/70 p-3">
            <span className="text-xl" aria-hidden>
              👀
            </span>
            <div>
              <p className="font-semibold">Apuestas de la familia</p>
              <p className="text-xs text-carbon/70">
                Solo verás las apuestas de los demás cuando empiece el partido. ¡Nada de hacer
                trampa!
              </p>
            </div>
          </div>
        </div>

        <button type="button" onClick={close} className="btn-primary mt-6 w-full">
          ¡Entendido, vamos a jugar!
        </button>
      </div>
    </dialog>
  );
}
