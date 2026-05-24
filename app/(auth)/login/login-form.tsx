"use client";

import { useFormState } from "react-dom";
import { loginAction } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Nombre</span>
        <input
          name="displayName"
          required
          autoComplete="username"
          className="input-base"
          placeholder="Tu nombre"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Contraseña</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="input-base"
        />
      </label>
      {state && !state.ok && (
        <p className="rounded-md bg-cancha/10 px-3 py-2 text-sm text-cancha">{state.error}</p>
      )}
      <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
