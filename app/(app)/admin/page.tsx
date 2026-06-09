import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminMatchList } from "./admin-match-list";
import { CopyButton } from "@/components/CopyButton";
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
      <main className="mx-auto flex max-w-screen-sm flex-col items-center px-4 py-16 text-center">
        <span className="text-5xl" aria-hidden>
          🔒
        </span>
        <h1 className="mt-3 font-headline text-3xl uppercase tracking-wider">Acceso denegado</h1>
        <p className="mt-2 max-w-xs text-sm text-carbon/60">
          Solo quien organiza la polla puede ver esta sección. Pide acceso si crees que es un error.
        </p>
        <Link href="/matches" className="btn-primary mt-6">
          Volver al inicio
        </Link>
      </main>
    );
  }

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_time", { ascending: false });

  const inviteCode = process.env.FAMILY_INVITE_CODE ?? "(env no configurada)";
  const matchList = (matches ?? []) as Match[];

  return (
    <div className="mx-auto max-w-screen-sm space-y-6 px-4 py-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cancha">
          Zona admin
        </p>
        <h1 className="mt-1 font-headline text-4xl uppercase tracking-wide">Panel de control</h1>
      </header>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-carbon/60">
          Código familiar
        </h2>
        <p className="mt-1 text-xs text-carbon/60">
          Compártelo con quien quiera unirse a la polla. No lo postees en redes — esto es solo para
          la familia.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-md bg-marfil p-2">
          <code className="flex-1 truncate font-mono text-base tracking-[0.18em] text-carbon">
            {inviteCode}
          </code>
          <CopyButton value={inviteCode} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-2">
          <h2 className="font-headline text-xl uppercase tracking-wider">Editar resultados</h2>
          <span className="text-[11px] text-carbon/55">
            {matchList.length} {matchList.length === 1 ? "partido" : "partidos"}
          </span>
        </div>
        <p className="mb-3 text-xs text-carbon/60">
          Útil si el sync automático falla. Al guardar se recalculan los puntos de todas las
          apuestas del partido.
        </p>
        {matchList.length ? (
          <AdminMatchList matches={matchList} />
        ) : (
          <div className="rounded-xl bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-5xl" aria-hidden>
              📋
            </p>
            <p className="mt-3 font-headline text-2xl uppercase tracking-wide text-carbon">
              Sin partidos cargados
            </p>
            <p className="mt-1 text-sm text-carbon/60">
              Usá el cron de sincronización o cargá un partido manualmente para empezar.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
