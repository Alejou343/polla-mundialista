import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";
import { Emblem } from "@/components/Emblem";

export default async function SignupPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/matches");

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-sm flex-col justify-center bg-stadium bg-stadium-spotlight bg-no-repeat px-5 py-10">
      <div className="text-center">
        <div className="flex justify-center">
          <Emblem size="lg" withWordmark={false} />
        </div>
        <p className="kicker mt-4">Únete a la polla</p>
        <h1 className="mt-1 font-display text-5xl leading-[0.95] tracking-tight text-trophy-200 drop-shadow-[0_2px_24px_rgba(250,204,21,0.35)]">
          Bienvenido
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Pide a quien organiza la polla un{" "}
          <strong className="text-trophy-200">código familiar</strong> para empezar.
        </p>
      </div>

      <div className="surface-card mt-8 p-5">
        <h2 className="font-display text-2xl uppercase tracking-wide text-trophy-200">
          Crear cuenta
        </h2>
        <p className="mt-1 text-xs text-ink-muted">Vas a aparecer en el ranking con tu nombre.</p>
        <div className="mt-5">
          <SignupForm />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-headline uppercase tracking-wider text-trophy-200 underline-offset-4 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
