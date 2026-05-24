"use client";

import { HowToPlayModal } from "./HowToPlayModal";

export function HelpButton() {
  return (
    <>
      <button
        type="button"
        aria-label="¿Cómo se juega?"
        title="¿Cómo se juega?"
        onClick={() => window.dispatchEvent(new CustomEvent("polla:open-howto"))}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-carbon/5 text-sm text-carbon/70 transition hover:bg-carbon/10"
      >
        ❓
      </button>
      <HowToPlayModal />
    </>
  );
}
