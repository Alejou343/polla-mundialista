"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { emailFromDisplayName } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Result } from "@/lib/types";

const LoginSchema = z.object({
  displayName: z.string().min(1, "Ingresa tu nombre"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export async function loginAction(
  _prevState: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  const parsed = LoginSchema.safeParse({
    displayName: formData.get("displayName"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  let email: string;
  try {
    email = emailFromDisplayName(parsed.data.displayName);
  } catch {
    return { ok: false, error: "Nombre inválido." };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });
  if (error) {
    return { ok: false, error: "Nombre o contraseña incorrectos." };
  }

  redirect("/matches");
}
