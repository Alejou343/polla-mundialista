"use client";

import { useFormState } from "react-dom";
import { loginAction } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="font-headline text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          Nombre
        </span>
        <input
          name="displayName"
          required
          autoComplete="username"
          className="input-base"
          placeholder="Tu nombre"
        />
      </label>
      <label className="block">
        <span className="font-headline text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          Contraseña
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="input-base"
        />
      </label>
      {state && !state.ok && (
        <p className="rounded-card border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-soft">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
