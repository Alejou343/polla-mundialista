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

  const live: Match[] = [];
  const upcoming: Match[] = [];
  const finished: Match[] = [];
  for (const m of matchList) {
    const s = computeMatchState(m, now);
    if (s === "live") live.push(m);
    else if (s === "finished") finished.push(m);
    else upcoming.push(m);
  }

  const pendingMatches = upcoming.filter((m) => !betByMatch.has(m.id));
  const nextDeadline = pendingMatches[0]?.kickoff_time ?? null;
  const pendingCount = pendingMatches.length;

  let visibleLive: Match[] = live;
  let visibleUpcoming: Match[] = upcoming;
  let visibleFinished: Match[] = [...finished].reverse();
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
    showFinishedAccordion = false;
  }

  const upcomingByDay = new Map<string, Match[]>();
  for (const m of visibleUpcoming) {
    const key = tournamentDayKey(m.kickoff_time);
    if (!upcomingByDay.has(key)) upcomingByDay.set(key, []);
    upcomingByDay.get(key)!.push(m);
  }

  const totalVisible = visibleLive.length + visibleUpcoming.length + visibleFinished.length;

  return (
    <div className="mx-auto max-w-screen-sm space-y-5 px-4 py-6">
      <header>
        <p className="kicker">Centro de predicciones</p>
        <h1 className="mt-1 font-display text-4xl uppercase tracking-wide text-trophy-200">
          Partidos
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Apuesta antes del pitazo inicial. Una vez arranca, queda en piedra.
        </p>
      </header>

      {view !== "pending" && (
        <PendingBanner pendingCount={pendingCount} nextDeadlineIso={nextDeadline} />
      )}

      <StageFilter activeStage={stage} activeView={view} pendingCount={pendingCount} />

      {totalVisible === 0 && (
        <div className="surface-card px-6 py-10 text-center">
          {view === "pending" ? (
            <>
              <p className="text-5xl" aria-hidden>
                ✅
              </p>
              <p className="mt-3 font-display text-2xl uppercase tracking-wide text-trophy-200">
                ¡Estás al día!
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                No te falta ninguna apuesta. Volvé cuando se publiquen más partidos.
              </p>
            </>
          ) : view === "played" ? (
            <>
              <p className="text-5xl" aria-hidden>
                ⚽
              </p>
              <p className="mt-3 font-display text-2xl uppercase tracking-wide text-trophy-200">
                Aún no hay partidos jugados
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Cuando termine el primero, lo verás aquí.
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl" aria-hidden>
                📅
              </p>
              <p className="mt-3 font-display text-2xl uppercase tracking-wide text-trophy-200">
                Sin partidos
              </p>
              <p className="mt-1 text-sm text-ink-muted">Aún no hay partidos para esta etapa.</p>
            </>
          )}
        </div>
      )}

      {visibleLive.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 font-display text-2xl uppercase tracking-wide text-danger-soft">
            <span className="live-dot" aria-hidden />
            En vivo ahora
          </h2>
          <div className="space-y-2">
            {visibleLive.map((m) => (
              <MatchCard key={m.id} match={m} bet={betByMatch.get(m.id)} />
            ))}
          </div>
        </section>
      )}

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

      {showFinishedAccordion && visibleFinished.length > 0 && (
        <details className="group surface-card overflow-hidden p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg uppercase tracking-wide text-ivory">
            <span className="flex items-center gap-2">
              ✅ Ya jugados
              <span className="rounded-pill border border-white/10 bg-white/5 px-2 py-0.5 font-headline text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                {visibleFinished.length}
              </span>
            </span>
            <span className="text-ink-muted transition group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-4 space-y-2">
            {visibleFinished.map((m) => (
              <MatchCard key={m.id} match={m} bet={betByMatch.get(m.id)} />
            ))}
          </div>
        </details>
      )}

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
