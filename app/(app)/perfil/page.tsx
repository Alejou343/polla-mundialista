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
  // Posición sin desempate: cantidad con estrictamente más puntos + 1.
  const position = entries.filter((e) => e.total_points > points).length + 1;

  const displayName = profile?.display_name ?? "Familiar";

  return (
    <div className="mx-auto max-w-screen-sm space-y-5 px-4 py-6">
      {/* Header */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-headline text-3xl uppercase tracking-wide">
                {displayName}
              </h1>
              {profile?.is_admin && (
                <span className="rounded-full bg-cancha/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cancha">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-carbon/60">
              {profile?.created_at
                ? `Miembro desde ${monthYear(profile.created_at)}`
                : "Miembro de la familia"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-marfil p-3 text-center">
          <div>
            <p className="font-headline text-3xl leading-none tabular-nums">{points}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-carbon/60">
              Puntos
            </p>
          </div>
          <div>
            <p className="font-headline text-3xl leading-none tabular-nums text-cesped">{exacts}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-carbon/60">
              Exactos
            </p>
          </div>
          <div>
            <p className="font-headline text-3xl leading-none tabular-nums text-trofeo">
              #{position}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-carbon/60">
              Lugar
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-carbon/60">
          Nombre
        </h2>
        <NameForm initial={displayName} />
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-carbon/60">
          Cambiar contraseña
        </h2>
        <PasswordForm />
      </section>

      <form action={signoutAction} className="text-center">
        <button
          type="submit"
          className="text-sm font-medium text-cancha transition hover:opacity-80"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
