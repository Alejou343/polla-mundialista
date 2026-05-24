import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminMatchRow } from "./admin-match-row";
import type { Match } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <main className="mx-auto max-w-screen-sm px-4 py-12 text-center">
        <h1 className="font-headline text-3xl text-cancha">Acceso denegado</h1>
        <p className="mt-2 text-carbon/60">Esta sección es solo para el admin de la polla.</p>
      </main>
    );
  }

  // Mostrar partidos que ya jugaron pero no se han cerrado, o cualquiera para editar a mano.
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_time", { ascending: false })
    .limit(50);

  const inviteCode = process.env.FAMILY_INVITE_CODE ?? "(env no configurada)";

  return (
    <div className="mx-auto max-w-screen-sm space-y-6 px-4 py-6">
      <h1 className="font-headline text-4xl text-cesped">Admin</h1>

      <section className="rounded-xl bg-trofeo/10 p-4">
        <h2 className="font-headline text-lg uppercase tracking-wide">Código familiar</h2>
        <p className="mt-1 text-sm text-carbon/70">Pásalo a los familiares por WhatsApp.</p>
        <code className="mt-2 block rounded bg-white px-3 py-2 font-mono text-lg">
          {inviteCode}
        </code>
        <p className="mt-2 text-xs text-carbon/60">
          Para cambiarlo, edita la variable <code>FAMILY_INVITE_CODE</code> en Vercel y redeploya.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-headline text-xl uppercase tracking-wide">
          Editar resultados (últimos 50 partidos)
        </h2>
        <p className="mb-3 text-xs text-carbon/60">
          Útil si el sync automático falla. Al guardar se recalculan los puntos de todas las
          apuestas del partido.
        </p>
        <div className="space-y-2">
          {(matches as Match[] | null)?.length ? (
            (matches as Match[]).map((m) => <AdminMatchRow key={m.id} match={m} />)
          ) : (
            <p className="rounded-lg bg-white p-4 text-sm text-carbon/60">
              Aún no hay partidos cargados.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
