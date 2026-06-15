"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Esperamos a load para no competir con la primera pintada.
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silencioso: la PWA funciona sin SW (solo se pierde el prompt de instalación nativo en Chrome).
      });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);
  return null;
}
