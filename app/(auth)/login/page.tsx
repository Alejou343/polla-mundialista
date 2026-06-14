import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";
import { Emblem } from "@/components/Emblem";

export default async function LoginPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/matches");

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col justify-center bg-stadium bg-stadium-spotlight bg-no-repeat px-5 py-10">
      <div className="text-center">
        <div className="flex justify-center">
          <Emblem size="xl" withWordmark={false} />
        </div>
        <p className="kicker mt-4">Polla Familiar</p>
        <h1 className="mt-1 font-display text-6xl leading-[0.95] tracking-tight text-trophy-200 drop-shadow-[0_2px_24px_rgba(250,204,21,0.35)]">
          <span className="block">Mundial</span>
          <span className="block">26</span>
        </h1>
        <p className="mt-4 text-sm text-ink-soft">
          Arma tus marcadores, suma puntos y pelea la tabla durante todo el mundial.
        </p>
      </div>

      <div className="surface-card mt-8 p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide text-trophy-200">
          Iniciar sesión
        </h2>
        <p className="mt-1 text-xs text-ink-muted">
          Usa el nombre y la contraseña con que te registraste.
        </p>
        <div className="mt-5">
          <LoginForm />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        ¿No tienes cuenta?{" "}
        <Link
          href="/signup"
          className="font-headline uppercase tracking-wider text-trophy-200 underline-offset-4 hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </main>
  );
}
