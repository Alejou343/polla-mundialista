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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="text-center font-headline text-5xl text-cesped">Únete a la Polla</h1>
      <p className="mt-2 text-center text-carbon/70">
        Necesitas el código familiar para registrarte.
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
      <p className="mt-6 text-center text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-cesped underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
