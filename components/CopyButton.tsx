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
      className={`inline-flex items-center gap-1 rounded-md bg-carbon px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 ${className}`}
    >
      {copied ? "✓ Copiado" : `📋 ${label}`}
    </button>
  );
}
