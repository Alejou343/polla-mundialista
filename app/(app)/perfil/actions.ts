"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/types";

const NameSchema = z.object({
  displayName: z.string().min(2).max(40),
});

const PasswordSchema = z.object({
  password: z.string().min(6).max(72),
});

export async function updateDisplayNameAction(
  _prevState: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const parsed = NameSchema.safeParse({
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Nombre inválido (2 a 40 caracteres)." };
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", user.id);
  if (error) {
    if (error.message.toLowerCase().includes("duplicate")) {
      return { ok: false, error: "Ya hay otro familiar con ese nombre." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/perfil");
  revalidatePath("/ranking");
  return { ok: true, data: null };
}

export async function updatePasswordAction(
  _prevState: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const parsed = PasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Contraseña inválida (mínimo 6 caracteres)." };
  }
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: null };
}
