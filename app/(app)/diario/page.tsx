import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { tournamentDayKey, tournamentDayLong, timeShort } from "@/lib/format";
import { formatDailyDigest } from "@/lib/daily-digest";
import { ShareButtons } from "./share-buttons";
import type { Match } from "@/lib/types";

export const dynamic = "force-dynamic";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function DiarioPage() {
  const supabase = createServerSupabaseClient();

  const nowIso = new Date().toISOString();
  const todayKey = tournamentDayKey(nowIso);

  const { data: matchesData } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_time", { ascending: true });

  const allMatches = (matchesData ?? []) as Match[];
  const todayMatches = allMatches.filter((m) => tournamentDayKey(m.kickoff_time) === todayKey);

  const nextDayWithMatches = allMatches.find((m) => tournamentDayKey(m.kickoff_time) > todayKey);
  const nextDayLabel = nextDayWithMatches
    ? capitalize(tournamentDayLong(nextDayWithMatches.kickoff_time))
    : null;
  const nextDayTime = nextDayWithMatches ? timeShort(nextDayWithMatches.kickoff_time) : null;

  const referenceIso = todayMatches[0]?.kickoff_time ?? nowIso;
  const dayLabel = capitalize(tournamentDayLong(referenceIso));
  const message = formatDailyDigest(todayMatches, referenceIso);

  return (
    <div className="mx-auto max-w-screen-sm space-y-5 px-4 py-6">
      <header>
        <p className="kicker">Compartir en el grupo</p>
        <h1 className="mt-1 font-display text-4xl uppercase tracking-wide text-trophy-200">
          Resumen del día
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {dayLabel} ·{" "}
          {todayMatches.length === 0
            ? "Hoy no hay partidos"
            : `${todayMatches.length} ${todayMatches.length === 1 ? "partido" : "partidos"}`}
        </p>
      </header>

      <ShareButtons message={message} />

      <section>
        <h2 className="kicker mb-2 flex items-center gap-2">
          <span aria-hidden>👁️</span> Vista previa del mensaje
        </h2>
        <pre
          className="surface-card whitespace-pre-wrap p-4 font-body text-[13px] leading-relaxed text-ivory"
          style={{ wordBreak: "break-word" }}
        >
          {message}
        </pre>
        <p className="mt-2 font-headline text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          Así se verá en WhatsApp. El texto con asteriscos sale en negrita automáticamente.
        </p>
      </section>

      {todayMatches.length === 0 && nextDayWithMatches && (
        <section className="surface-card p-4 text-center">
          <p className="text-sm text-ink-soft">
            Próximo día con partidos:{" "}
            <strong className="font-headline uppercase tracking-wide text-trophy-200">
              {nextDayLabel}
            </strong>{" "}
            a partir de las {nextDayTime}.
          </p>
          <Link
            href="/matches"
            className="mt-3 inline-block font-headline text-sm uppercase tracking-[0.16em] text-trophy-200 underline-offset-4 hover:underline"
          >
            Ver todos los partidos →
          </Link>
        </section>
      )}
    </div>
  );
}
