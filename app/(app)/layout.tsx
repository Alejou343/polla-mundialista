import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MobileMenu } from "@/components/MobileMenu";
import { HowToPlayModal } from "@/components/HowToPlayModal";

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
      <header className="sticky top-0 z-20 border-b border-carbon/10 bg-marfil/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-sm items-center justify-between px-4 py-3">
          <Link
            href="/matches"
            className="flex items-center gap-1.5 font-headline text-2xl tracking-wide text-cesped"
          >
            <span aria-hidden>⚽</span>
            <span>POLLA 2026</span>
          </Link>
          <MobileMenu
            displayName={displayName}
            isAdmin={!!profile?.is_admin}
            pendingCount={pendingCount}
          />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-carbon/10 py-4 text-center text-xs text-carbon/50">
        Polla Familiar Mundial 2026 · 🕒 Horarios en hora de Colombia.
      </footer>
      {/* Modal global: se abre con evento polla:open-howto desde el menú o auto al primer visit */}
      <HowToPlayModal />
    </div>
  );
}
