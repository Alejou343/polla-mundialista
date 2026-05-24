import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MatchCard } from "@/components/MatchCard";
import { DateGroupHeader } from "@/components/DateGroupHeader";
import { StageFilter } from "@/components/StageFilter";
import { tournamentDayKey } from "@/lib/format";
import type { Bet, Match, Stage } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STAGES: Stage[] = ["group", "r32", "r16", "qf", "sf", "third", "final"];

function isStage(s: string | undefined): s is Stage {
  return !!s && (VALID_STAGES as string[]).includes(s);
}

export default async function MatchesPage({ searchParams }: { searchParams?: { stage?: string } }) {
  const supabase = createServerSupabaseClient();
  const stage = isStage(searchParams?.stage) ? searchParams!.stage : "all";

  let q = supabase.from("matches").select("*").order("kickoff_time", { ascending: true });
  if (stage !== "all") q = q.eq("stage", stage);
  const { data: matches, error } = await q;

  if (error) throw new Error(error.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: myBets } = await supabase.from("bets").select("*").eq("user_id", user!.id);
  const betByMatch = new Map<string, Bet>((myBets ?? []).map((b) => [b.match_id, b as Bet]));

  const matchList = (matches ?? []) as Match[];

  // Agrupar por día del torneo (TZ Mexico City) — evita que matches
  // nocturnos del Mundial aparezcan como "el día siguiente" por UTC.
  const groups = new Map<string, Match[]>();
  for (const m of matchList) {
    const key = tournamentDayKey(m.kickoff_time);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }

  return (
    <div className="mx-auto max-w-screen-sm px-4 py-6">
      <h1 className="font-headline text-4xl text-cesped">Partidos</h1>
      <p className="text-sm text-carbon/60">
        Apuesta antes del pitazo inicial. Después, ya no se puede tocar.
      </p>

      <div className="mt-4">
        <StageFilter active={stage} />
      </div>

      {matchList.length === 0 ? (
        <p className="mt-12 text-center text-carbon/60">
          Aún no hay partidos cargados. El admin sincroniza la agenda cada día.
        </p>
      ) : (
        Array.from(groups.entries()).map(([day, ms]) => (
          <section key={day}>
            <DateGroupHeader isoDate={ms[0].kickoff_time} />
            <div className="space-y-2">
              {ms.map((m) => (
                <MatchCard key={m.id} match={m} bet={betByMatch.get(m.id)} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
