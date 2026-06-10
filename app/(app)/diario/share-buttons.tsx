"use client";

import { useEffect, useState } from "react";

export function ShareButtons({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = message;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } finally {
        ta.remove();
      }
    }
  }

  async function shareNative() {
    try {
      await navigator.share({
        title: "Polla Familiar Mundial 2026",
        text: message,
      });
    } catch {
      // usuario canceló o no soporta — ignorar
    }
  }

  return (
    <div className="space-y-2">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90 active:opacity-80"
      >
        <span aria-hidden className="text-lg">
          📲
        </span>
        Compartir en WhatsApp
      </a>

      <button
        type="button"
        onClick={copy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-base font-semibold text-carbon shadow-sm transition hover:bg-carbon/5 active:bg-carbon/10"
      >
        <span aria-hidden className="text-lg">
          {copied ? "✓" : "📋"}
        </span>
        {copied ? "¡Copiado!" : "Copiar texto"}
      </button>

      {canNativeShare && (
        <button
          type="button"
          onClick={shareNative}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-base font-semibold text-carbon shadow-sm transition hover:bg-carbon/5 active:bg-carbon/10"
        >
          <span aria-hidden className="text-lg">
            📤
          </span>
          Compartir en otra app
        </button>
      )}
    </div>
  );
}
