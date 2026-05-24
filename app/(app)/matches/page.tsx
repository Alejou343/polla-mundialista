import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MatchCard } from "@/components/MatchCard";
import { DateGroupHeader } from "@/components/DateGroupHeader";
import { StageFilter, type MatchView } from "@/components/StageFilter";
import { PendingBanner } from "@/components/PendingBanner";
import { tournamentDayKey } from "@/lib/format";
import { computeMatchState } from "@/lib/match-state";
import type { Bet, Match, Stage } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STAGES: Stage[] = ["group", "r32", "r16", "qf", "sf", "third", "final"];

function isStage(s: string | undefined): s is Stage {
  return !!s && (VALID_STAGES as string[]).includes(s);
}

function isView(s: string | undefined): s is MatchView {
  return s === "pending" || s === "played" || s === "all";
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams?: { stage?: string; view?: string };
}) {
  const supabase = createServerSupabaseClient();
  const stage = isStage(searchParams?.stage) ? searchParams!.stage : "all";
  const view: MatchView = isView(searchParams?.view) ? searchParams!.view : "all";

  let q = supabase.from("matches").select("*").order("kickoff_time", { ascending: true });
  if (stage !== "all") q = q.eq("stage", stage);
  const { data: matchesData, error } = await q;
  if (error) throw new Error(error.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;
  const { data: myBets } = await supabase.from("bets").select("*").eq("user_id", userId);
  const betByMatch = new Map<string, Bet>((myBets ?? []).map((b) => [b.match_id, b as Bet]));

  const matchList = (matchesData ?? []) as Match[];
  const now = new Date();

  // Particionar por estado
  const live: Match[] = [];
  const upcoming: Match[] = [];
  const finished: Match[] = [];
  for (const m of matchList) {
    const s = computeMatchState(m, now);
    if (s === "live") live.push(m);
    else if (s === "finished") finished.push(m);
    else upcoming.push(m);
  }

  // Filtrar por vista
  const pendingMatches = upcoming.filter((m) => !betByMatch.has(m.id));
  const nextDeadline = pendingMatches[0]?.kickoff_time ?? null;
  const pendingCount = pendingMatches.length;

  let visibleLive: Match[] = live;
  let visibleUpcoming: Match[] = upcoming;
  let visibleFinished: Match[] = [...finished].reverse(); // más recientes arriba
  let showFinishedAccordion = true;

  if (view === "pending") {
    visibleLive = [];
    visibleUpcoming = pendingMatches;
    visibleFinished = [];
    showFinishedAccordion = false;
  } else if (view === "played") {
    visibleLive = [];
    visibleUpcoming = [];
    visibleFinished = [...finished].reverse();
    showFinishedAccordion = false; // mostrar inline, no en accordion
  }

  // Agrupar upcoming por día (TZ Bogotá)
  const upcomingByDay = new Map<string, Match[]>();
  for (const m of visibleUpcoming) {
    const key = tournamentDayKey(m.kickoff_time);
    if (!upcomingByDay.has(key)) upcomingByDay.set(key, []);
    upcomingByDay.get(key)!.push(m);
  }

  const totalVisible = visibleLive.length + visibleUpcoming.length + visibleFinished.length;

  return (
    <div className="mx-auto max-w-screen-sm space-y-4 px-4 py-6">
      <header>
        <h1 className="font-headline text-4xl uppercase tracking-wide text-cesped">Partidos</h1>
        <p className="text-sm text-carbon/60">
          Apuesta antes de que empiece el partido. Una vez suena el pitazo, no se puede tocar.
        </p>
      </header>

      {view !== "pending" && (
        <PendingBanner pendingCount={pendingCount} nextDeadlineIso={nextDeadline} />
      )}

      <StageFilter activeStage={stage} activeView={view} pendingCount={pendingCount} />

      {totalVisible === 0 && (
        <div className="rounded-xl bg-white px-6 py-10 text-center shadow-sm">
          {view === "pending" ? (
            <>
              <p className="text-5xl" aria-hidden>
                ✅
              </p>
              <p className="mt-3 font-headline text-2xl uppercase tracking-wide">¡Estás al día!</p>
              <p className="mt-1 text-sm text-carbon/60">
                No te falta ninguna apuesta. Volvé cuando se publiquen más partidos.
              </p>
            </>
          ) : view === "played" ? (
            <>
              <p className="text-5xl" aria-hidden>
                ⚽
              </p>
              <p className="mt-3 font-headline text-2xl uppercase tracking-wide">
                Aún no hay partidos jugados
              </p>
              <p className="mt-1 text-sm text-carbon/60">
                Cuando termine el primero, lo verás aquí.
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl" aria-hidden>
                📅
              </p>
              <p className="mt-3 font-headline text-2xl uppercase tracking-wide">Sin partidos</p>
              <p className="mt-1 text-sm text-carbon/60">Aún no hay partidos para esta etapa.</p>
            </>
          )}
        </div>
      )}

      {/* 🔴 EN VIVO */}
      {visibleLive.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 font-headline text-xl uppercase tracking-wide text-cancha">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cancha" />
            En vivo ahora
          </h2>
          <div className="space-y-2">
            {visibleLive.map((m) => (
              <MatchCard key={m.id} match={m} bet={betByMatch.get(m.id)} />
            ))}
          </div>
        </section>
      )}

      {/* 📅 PRÓXIMOS */}
      {visibleUpcoming.length > 0 &&
        Array.from(upcomingByDay.entries()).map(([day, ms]) => (
          <section key={day}>
            <DateGroupHeader isoDate={ms[0].kickoff_time} />
            <div className="space-y-2">
              {ms.map((m) => (
                <MatchCard key={m.id} match={m} bet={betByMatch.get(m.id)} />
              ))}
            </div>
          </section>
        ))}

      {/* ✅ YA JUGADOS */}
      {showFinishedAccordion && visibleFinished.length > 0 && (
        <details className="group rounded-xl bg-white p-4 shadow-sm open:bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between font-headline text-base uppercase tracking-wide text-carbon">
            <span className="flex items-center gap-2">
              ✅ Ya jugados
              <span className="rounded-full bg-carbon/10 px-2 py-0.5 text-[11px] font-semibold text-carbon">
                {visibleFinished.length}
              </span>
            </span>
            <span className="text-xs text-carbon/50 transition group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-3 space-y-2">
            {visibleFinished.map((m) => (
              <MatchCard key={m.id} match={m} bet={betByMatch.get(m.id)} />
            ))}
          </div>
        </details>
      )}

      {/* Vista "played" muestra inline */}
      {!showFinishedAccordion && view === "played" && visibleFinished.length > 0 && (
        <section className="space-y-2">
          {visibleFinished.map((m) => (
            <MatchCard key={m.id} match={m} bet={betByMatch.get(m.id)} />
          ))}
        </section>
      )}
    </div>
  );
}
