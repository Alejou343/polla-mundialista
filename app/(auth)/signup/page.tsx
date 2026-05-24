import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/matches");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-10">
      <div className="text-center">
        <p className="text-2xl" aria-hidden>
          ⚽
        </p>
        <h1 className="mt-2 font-headline text-5xl leading-[0.95] tracking-wide text-cesped">
          <span className="block">ÚNETE A LA POLLA</span>
        </h1>
        <p className="mt-3 text-sm text-carbon/70">
          Pide a quien organiza la polla un <strong className="text-carbon">código familiar</strong>{" "}
          para empezar.
        </p>
      </div>

      <div className="mt-8 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-headline text-xl uppercase tracking-wider">Crear cuenta</h2>
        <p className="mt-1 text-xs text-carbon/60">Vas a aparecer en el ranking con tu nombre.</p>
        <div className="mt-4">
          <SignupForm />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-carbon/70">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-cesped underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
