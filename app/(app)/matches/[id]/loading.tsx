// Skeleton del detalle de partido — hero card grande + sección "Tu apuesta"
export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-sm px-4 py-6">
      {/* Breadcrumb */}
      <div className="h-4 w-16 animate-pulse rounded bg-carbon/10" />

      {/* Hero card */}
      <div className="mt-3 rounded-xl border border-carbon/5 bg-white p-5 shadow-sm">
        {/* Etapa + badge */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-carbon/10" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-carbon/10" />
        </div>

        {/* Sede + fecha */}
        <div className="mt-3 flex flex-col items-center gap-1.5">
          <div className="h-3 w-40 animate-pulse rounded bg-carbon/10" />
          <div className="h-3 w-52 animate-pulse rounded bg-carbon/10" />
        </div>

        {/* Equipos + marcador */}
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Local */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-20 animate-pulse rounded-sm bg-carbon/10" />
            <div className="h-4 w-20 animate-pulse rounded bg-carbon/10" />
          </div>

          {/* Marcador central — ocupa el espacio del font-headline text-7xl */}
          <div className="flex items-center gap-2">
            <div className="h-16 w-10 animate-pulse rounded bg-carbon/10" />
            <div className="h-4 w-3 animate-pulse rounded bg-carbon/10" />
            <div className="h-16 w-10 animate-pulse rounded bg-carbon/10" />
          </div>

          {/* Visitante */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-14 w-20 animate-pulse rounded-sm bg-carbon/10" />
            <div className="h-4 w-20 animate-pulse rounded bg-carbon/10" />
          </div>
        </div>
      </div>

      {/* Sección "Tu apuesta" */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-6 w-28 animate-pulse rounded bg-carbon/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-carbon/10" />
        </div>

        {/* BetForm fantasma */}
        <div className="rounded-xl border border-carbon/5 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex flex-col items-center gap-2">
              <div className="h-3 w-12 animate-pulse rounded bg-carbon/10" />
              <div className="h-12 w-full animate-pulse rounded-lg bg-carbon/10" />
            </div>
            <div className="h-5 w-3 animate-pulse rounded bg-carbon/10" />
            <div className="flex flex-col items-center gap-2">
              <div className="h-3 w-12 animate-pulse rounded bg-carbon/10" />
              <div className="h-12 w-full animate-pulse rounded-lg bg-carbon/10" />
            </div>
          </div>
          <div className="mt-4 h-11 w-full animate-pulse rounded-xl bg-carbon/10" />
        </div>
      </div>
    </div>
  );
}
