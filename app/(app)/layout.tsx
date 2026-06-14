import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MobileMenu } from "@/components/MobileMenu";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { Emblem } from "@/components/Emblem";
import { BottomNav } from "@/components/BottomNav";

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
    <div className="relative flex min-h-dvh flex-col bg-stadium bg-stadium-spotlight bg-no-repeat">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-stadium/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-sm items-center justify-between px-4 py-3">
          <Emblem href="/matches" size="md" />
          <MobileMenu
            displayName={displayName}
            isAdmin={!!profile?.is_admin}
            pendingCount={pendingCount}
          />
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-8">{children}</main>

      <footer className="hidden border-t border-white/5 py-4 text-center text-[11px] uppercase tracking-[0.2em] text-ink-muted md:block">
        Polla Familiar 26 · Horarios en hora de Colombia
      </footer>

      <BottomNav pendingCount={pendingCount} />

      <HowToPlayModal />
    </div>
  );
}
