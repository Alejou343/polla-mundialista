"use client";

import { useFormState } from "react-dom";
import { updateDisplayNameAction, updatePasswordAction } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function NameForm({ initial }: { initial: string }) {
  const [state, formAction] = useFormState(updateDisplayNameAction, null);
  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Nombre para mostrar</span>
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
        <p className="rounded bg-cesped/10 px-3 py-2 text-sm text-cesped">Nombre actualizado.</p>
      )}
      {state && !state.ok && (
        <p className="rounded bg-cancha/10 px-3 py-2 text-sm text-cancha">{state.error}</p>
      )}
      <SubmitButton pendingLabel="Guardando…" className="btn-primary">
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
        <span className="text-sm font-medium">Nueva contraseña</span>
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
        <p className="rounded bg-cesped/10 px-3 py-2 text-sm text-cesped">
          Contraseña actualizada.
        </p>
      )}
      {state && !state.ok && (
        <p className="rounded bg-cancha/10 px-3 py-2 text-sm text-cancha">{state.error}</p>
      )}
      <SubmitButton pendingLabel="Guardando…" className="btn-primary">
        Cambiar contraseña
      </SubmitButton>
    </form>
  );
}
