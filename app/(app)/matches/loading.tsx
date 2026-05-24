// Skeleton de la página de partidos — aproxima header + StageFilter + 3 MatchCards
export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-sm space-y-4 px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-10 w-36 animate-pulse rounded bg-carbon/10" />
        <div className="h-4 w-64 animate-pulse rounded bg-carbon/10" />
      </div>

      {/* PendingBanner fantasma */}
      <div className="h-12 animate-pulse rounded-xl bg-carbon/10" />

      {/* StageFilter fantasma — fila de píldoras */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-carbon/10" />
        ))}
      </div>

      {/* DateGroupHeader fantasma */}
      <div className="h-5 w-40 animate-pulse rounded bg-carbon/10" />

      {/* 3 MatchCards fantasma */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-carbon/5 bg-white p-4 shadow-sm">
          {/* Header: etapa + badge */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 animate-pulse rounded bg-carbon/10" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-carbon/10" />
          </div>

          {/* Equipos + VS */}
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            {/* Local */}
            <div className="flex flex-col items-center gap-2">
              {/* Bandera redonda */}
              <div className="h-10 w-14 animate-pulse rounded-sm bg-carbon/10" />
              <div className="h-3 w-16 animate-pulse rounded bg-carbon/10" />
            </div>

            {/* Score central */}
            <div className="flex flex-col items-center gap-1">
              <div className="h-8 w-16 animate-pulse rounded bg-carbon/10" />
            </div>

            {/* Visitante */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-14 animate-pulse rounded-sm bg-carbon/10" />
              <div className="h-3 w-16 animate-pulse rounded bg-carbon/10" />
            </div>
          </div>

          {/* Footer: sede + apuesta */}
          <div className="mt-3 flex items-center justify-between">
            <div className="h-3 w-28 animate-pulse rounded bg-carbon/10" />
            <div className="h-3 w-20 animate-pulse rounded bg-carbon/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
