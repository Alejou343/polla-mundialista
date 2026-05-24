"use client";

import { useFormState } from "react-dom";
import { signupAction } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Nombre para mostrar</span>
        <input
          name="displayName"
          required
          minLength={2}
          maxLength={40}
          autoComplete="username"
          className="input-base"
          placeholder="Cómo aparecerás en el ranking"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Contraseña</span>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="input-base"
        />
        <span className="mt-1 block text-xs text-carbon/60">
          Mínimo 6 caracteres. Si la olvidas, el admin la resetea.
        </span>
      </label>
      <label className="block">
        <span className="text-sm font-medium">Código familiar</span>
        <input
          name="inviteCode"
          required
          className="input-base"
          placeholder="Te lo pasamos por WhatsApp"
        />
      </label>
      {state && !state.ok && (
        <p className="rounded-md bg-cancha/10 px-3 py-2 text-sm text-cancha">{state.error}</p>
      )}
      <SubmitButton pendingLabel="Creando…">Crear cuenta</SubmitButton>
    </form>
  );
}
