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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="text-center font-headline text-6xl text-cesped">Polla Mundial 2026</h1>
      <p className="mt-2 text-center text-carbon/70">Inicia sesión para apostar.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-sm">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="text-cesped underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
