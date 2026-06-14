import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NameForm, PasswordForm } from "./perfil-form";
import { Avatar } from "@/components/Avatar";
import { signoutAction } from "@/app/(app)/actions";
import { monthYear } from "@/lib/format";
import type { LeaderboardEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin, created_at")
    .eq("id", userId)
    .single();

  const { data: lb } = await supabase
    .from("leaderboard")
    .select("user_id, total_points, exact_scores");
  const entries = (lb ?? []) as LeaderboardEntry[];
  const me = entries.find((e) => e.user_id === userId);
  const points = me?.total_points ?? 0;
  const exacts = me?.exact_scores ?? 0;
  const position = entries.filter((e) => e.total_points > points).length + 1;

  const displayName = profile?.display_name ?? "Familiar";

  return (
    <div className="mx-auto max-w-screen-sm space-y-5 px-4 py-6">
      <section className="surface-card p-5">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-3xl uppercase tracking-wide text-trophy-200">
                {displayName}
              </h1>
              {profile?.is_admin && (
                <span className="rounded-pill border border-trophy-200/30 bg-trophy-200/10 px-2 py-0.5 font-headline text-[10px] uppercase tracking-[0.2em] text-trophy-200">
                  Admin
                </span>
              )}
            </div>
            <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              {profile?.created_at
                ? `Miembro desde ${monthYear(profile.created_at)}`
                : "Miembro de la familia"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-card border border-white/10 bg-stadium-200/60 p-3 text-center">
          <div>
            <p className="font-display text-3xl leading-none tabular-nums text-ivory">{points}</p>
            <p className="kicker mt-1">Puntos</p>
          </div>
          <div>
            <p className="font-display text-3xl leading-none tabular-nums text-success-soft">
              {exacts}
            </p>
            <p className="kicker mt-1">Exactos</p>
          </div>
          <div>
            <p className="font-display text-3xl leading-none tabular-nums text-trophy-200">
              #{position}
            </p>
            <p className="kicker mt-1">Lugar</p>
          </div>
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="kicker mb-3">Nombre</h2>
        <NameForm initial={displayName} />
      </section>

      <section className="surface-card p-5">
        <h2 className="kicker mb-3">Cambiar contraseña</h2>
        <PasswordForm />
      </section>

      <form action={signoutAction} className="text-center">
        <button
          type="submit"
          className="font-headline text-sm uppercase tracking-[0.18em] text-danger-soft transition hover:text-danger"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
