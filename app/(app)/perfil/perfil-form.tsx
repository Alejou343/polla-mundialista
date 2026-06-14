"use client";

import { useFormState } from "react-dom";
import { updateDisplayNameAction, updatePasswordAction } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function NameForm({ initial }: { initial: string }) {
  const [state, formAction] = useFormState(updateDisplayNameAction, null);
  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="font-headline text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          Nombre para mostrar
        </span>
        <input
          name="displayName"
          defaultValue={initial}
          required
          minLength={2}
          maxLength={40}
          className="input-base"
        />
      </label>
      {state?.ok && (
        <p className="rounded-card border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-soft">
          Nombre actualizado.
        </p>
      )}
      {state && !state.ok && (
        <p className="rounded-card border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-soft">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Guardando…" className="btn-primary w-full">
        Guardar nombre
      </SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useFormState(updatePasswordAction, null);
  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="font-headline text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          Nueva contraseña
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="input-base"
        />
      </label>
      {state?.ok && (
        <p className="rounded-card border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-soft">
          Contraseña actualizada.
        </p>
      )}
      {state && !state.ok && (
        <p className="rounded-card border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-soft">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Guardando…" className="btn-primary w-full">
        Cambiar contraseña
      </SubmitButton>
    </form>
  );
}
