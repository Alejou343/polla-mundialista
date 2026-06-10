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

  // Si hoy no hay partidos, buscamos el próximo día con partidos para sugerir.
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cesped">
          Compartir en el grupo
        </p>
        <h1 className="mt-1 font-headline text-4xl uppercase tracking-wide text-carbon">
          Resumen del día
        </h1>
        <p className="mt-1 text-sm text-carbon/60">
          {dayLabel} ·{" "}
          {todayMatches.length === 0
            ? "Hoy no hay partidos"
            : `${todayMatches.length} ${todayMatches.length === 1 ? "partido" : "partidos"}`}
        </p>
      </header>

      <ShareButtons message={message} />

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-carbon/60">
          <span aria-hidden>👁️</span> Vista previa del mensaje
        </h2>
        <pre
          className="whitespace-pre-wrap rounded-xl bg-white p-4 font-sans text-[13px] leading-relaxed text-carbon shadow-sm"
          style={{ wordBreak: "break-word" }}
        >
          {message}
        </pre>
        <p className="mt-2 text-[11px] text-carbon/50">
          Así se verá en WhatsApp. El texto con asteriscos sale en negrita automáticamente.
        </p>
      </section>

      {todayMatches.length === 0 && nextDayWithMatches && (
        <section className="rounded-xl bg-marfil/60 p-4 text-center ring-1 ring-carbon/5">
          <p className="text-sm text-carbon/70">
            Próximo día con partidos: <strong className="text-carbon">{nextDayLabel}</strong> a
            partir de las {nextDayTime}.
          </p>
          <Link
            href="/matches"
            className="mt-2 inline-block text-sm font-semibold text-cesped underline"
          >
            Ver todos los partidos →
          </Link>
        </section>
      )}
    </div>
  );
}
