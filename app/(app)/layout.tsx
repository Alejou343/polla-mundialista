import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SignoutButton } from "@/components/SignoutButton";

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-carbon/10 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-screen-sm items-center justify-between px-4 py-3">
          <Link href="/matches" className="font-headline text-2xl tracking-wide text-cesped">
            ⚽ Polla 2026
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/matches" className="text-carbon hover:text-cesped">
              Partidos
            </Link>
            <Link href="/ranking" className="text-carbon hover:text-cesped">
              Ranking
            </Link>
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="rounded bg-trofeo/20 px-2 py-0.5 font-medium text-carbon"
              >
                Admin
              </Link>
            )}
            <Link href="/perfil" className="text-carbon hover:text-cesped">
              {profile?.display_name ?? "Perfil"}
            </Link>
            <SignoutButton />
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-carbon/10 py-4 text-center text-xs text-carbon/50">
        Polla Familiar Mundial 2026 · Hecho con ⚽ por la familia.
      </footer>
    </div>
  );
}
