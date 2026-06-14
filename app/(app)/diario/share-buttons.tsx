"use client";

import { useEffect, useState } from "react";
import { Check, Clipboard, Send, Share2 } from "lucide-react";

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
        title: "Polla Familiar 26",
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
        className="flex w-full items-center justify-center gap-2 rounded-card bg-[#25D366] px-4 py-3.5 font-headline text-base uppercase tracking-[0.12em] text-white shadow-card transition hover:brightness-110 active:brightness-95"
      >
        <Send size={18} strokeWidth={2.2} aria-hidden />
        Compartir en WhatsApp
      </a>

      <button
        type="button"
        onClick={copy}
        className="flex w-full items-center justify-center gap-2 rounded-card border border-white/10 bg-white/[0.04] px-4 py-3.5 font-headline text-base uppercase tracking-[0.12em] text-ivory transition hover:bg-white/[0.08]"
      >
        {copied ? (
          <Check size={18} strokeWidth={2.4} className="text-success-soft" aria-hidden />
        ) : (
          <Clipboard size={18} strokeWidth={2.2} aria-hidden />
        )}
        {copied ? "¡Copiado!" : "Copiar texto"}
      </button>

      {canNativeShare && (
        <button
          type="button"
          onClick={shareNative}
          className="flex w-full items-center justify-center gap-2 rounded-card border border-white/10 bg-white/[0.04] px-4 py-3.5 font-headline text-base uppercase tracking-[0.12em] text-ivory transition hover:bg-white/[0.08]"
        >
          <Share2 size={18} strokeWidth={2.2} aria-hidden />
          Compartir en otra app
        </button>
      )}
    </div>
  );
}
