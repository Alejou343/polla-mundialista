"use client";

import { signoutAction } from "@/app/(app)/actions";

export function SignoutButton() {
  return (
    <form action={signoutAction}>
      <button type="submit" className="text-sm text-carbon/60 transition hover:text-cancha">
        Salir
      </button>
    </form>
  );
}
