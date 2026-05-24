import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/matches");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-10">
      <div className="text-center">
        <p className="text-3xl" aria-hidden>
          ⚽
        </p>
        <h1 className="mt-2 font-headline text-6xl leading-[0.95] tracking-wide text-cesped">
          <span className="block">POLLA</span>
          <span className="block">MUNDIAL</span>
          <span className="block">2026</span>
        </h1>
        <p className="mt-3 text-sm text-carbon/70">
          Predice los marcadores. Compite con la familia.
        </p>
      </div>

      <div className="mt-8 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-headline text-xl uppercase tracking-wider">Iniciar sesión</h2>
        <p className="mt-1 text-xs text-carbon/60">
          Usa el nombre y la contraseña con que te registraste.
        </p>
        <div className="mt-4">
          <LoginForm />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-carbon/70">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="font-medium text-cesped underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
