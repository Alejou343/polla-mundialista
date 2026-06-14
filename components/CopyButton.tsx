"use client";

import { useState } from "react";

export function CopyButton({
  value,
  className = "",
  label = "Copiar",
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Algunos navegadores móviles bloquean si no es secure context; fallback:
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } finally {
        ta.remove();
      }
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-1 rounded-pill border border-trophy-200/40 bg-trophy-200/10 px-3 py-1.5 font-headline text-[11px] uppercase tracking-[0.14em] text-trophy-200 transition hover:bg-trophy-200/20 ${className}`}
    >
      {copied ? "✓ Copiado" : `📋 ${label}`}
    </button>
  );
}
