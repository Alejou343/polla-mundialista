import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NameForm, PasswordForm } from "./perfil-form";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin, created_at")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-screen-sm space-y-8 px-4 py-6">
      <header>
        <h1 className="font-headline text-4xl text-cesped">Tu perfil</h1>
        <p className="text-sm text-carbon/60">
          {profile?.is_admin && "🛠️ Eres admin · "}
          Miembro desde{" "}
          {profile?.created_at &&
            new Intl.DateTimeFormat("es", {
              year: "numeric",
              month: "long",
            }).format(new Date(profile.created_at))}
        </p>
      </header>

      <section className="rounded-xl bg-white p-4">
        <h2 className="mb-3 font-headline text-xl uppercase tracking-wide">Nombre</h2>
        <NameForm initial={profile?.display_name ?? ""} />
      </section>

      <section className="rounded-xl bg-white p-4">
        <h2 className="mb-3 font-headline text-xl uppercase tracking-wide">Cambiar contraseña</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
