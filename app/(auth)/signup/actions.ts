"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { emailFromDisplayName } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/types";

const SignupSchema = z.object({
  displayName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(40, "El nombre es muy largo"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(72, "La contraseña es muy larga"),
  inviteCode: z.string().min(1, "Ingresa el código familiar"),
});

export async function signupAction(
  _prevState: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const parsed = SignupSchema.safeParse({
    displayName: formData.get("displayName"),
    password: formData.get("password"),
    inviteCode: formData.get("inviteCode"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  if (parsed.data.inviteCode !== process.env.FAMILY_INVITE_CODE) {
    return { ok: false, error: "Código familiar incorrecto." };
  }

  let email: string;
  try {
    email = emailFromDisplayName(parsed.data.displayName);
  } catch {
    return { ok: false, error: "Nombre inválido." };
  }

  const admin = createAdminSupabaseClient();

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { display_name: parsed.data.displayName },
  });
  if (createErr || !created.user) {
    const msg = (createErr?.message ?? "").toLowerCase();
    if (msg.includes("exists") || msg.includes("already") || msg.includes("registered")) {
      return { ok: false, error: "Ya existe un usuario con ese nombre." };
    }
    return { ok: false, error: "No se pudo crear el usuario. Intenta de nuevo." };
  }

  const { error: profileErr } = await admin.from("profiles").insert({
    id: created.user.id,
    display_name: parsed.data.displayName,
    is_admin: false,
  });
  if (profileErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    if (profileErr.message.toLowerCase().includes("duplicate")) {
      return { ok: false, error: "Ya existe un usuario con ese nombre." };
    }
    return { ok: false, error: "No se pudo crear el perfil. Avisa al admin." };
  }

  const supabase = createServerSupabaseClient();
  const { error: loginErr } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (loginErr) {
    return {
      ok: false,
      error: "Cuenta creada, pero no logramos iniciar sesión. Intenta entrar manualmente.",
    };
  }

  redirect("/matches");
}
