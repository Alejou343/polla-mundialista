import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SignoutButton } from "@/components/SignoutButton";
import { NavPill } from "@/components/NavPill";
import { HelpButton } from "@/components/HelpButton";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_admin")
    .eq("id", user.id)
    .single();

  // Contar apuestas pendientes (matches abiertos sin bet del user).
  const nowIso = new Date().toISOString();
  const { data: openMatches } = await supabase
    .from("matches")
    .select("id")
    .gt("kickoff_time", nowIso);
  const { data: myBets } = await supabase.from("bets").select("match_id").eq("user_id", user.id);
  const myBetsSet = new Set((myBets ?? []).map((b) => b.match_id));
  const pendingCount = (openMatches ?? []).filter((m) => !myBetsSet.has(m.id)).length;

  const displayName = profile?.display_name ?? "Familiar";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-carbon/10 bg-marfil/95 backdrop-blur">
        <div className="mx-auto max-w-screen-sm px-4 pt-3">
          <div className="flex items-center justify-between">
            <Link
              href="/matches"
              className="flex items-center gap-1.5 font-headline text-2xl tracking-wide text-cesped"
            >
              <span aria-hidden>⚽</span>
              <span>POLLA 2026</span>
            </Link>
            <div className="flex items-center gap-2">
              <HelpButton />
              <SignoutButton />
            </div>
          </div>
          <nav className="-mx-1 mt-2 flex items-center gap-1 overflow-x-auto pb-2">
            <NavPill href="/matches" badge={pendingCount}>
              Partidos
            </NavPill>
            <NavPill href="/ranking">Ranking</NavPill>
            {profile?.is_admin && <NavPill href="/admin">Admin</NavPill>}
            <NavPill href="/perfil" avatarName={displayName}>
              {displayName}
            </NavPill>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-carbon/10 py-4 text-center text-xs text-carbon/50">
        Polla Familiar Mundial 2026 · 🕒 Horarios en hora de Colombia.
      </footer>
    </div>
  );
}
