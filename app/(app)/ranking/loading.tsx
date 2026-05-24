// Skeleton del ranking — podio de 3 columnas + tabla de 5 filas
export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-sm space-y-6 px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-10 w-36 animate-pulse rounded bg-carbon/10" />
        <div className="h-4 w-52 animate-pulse rounded bg-carbon/10" />
      </div>

      {/* Podio fantasma — 3 columnas con barras de distintas alturas */}
      <div className="rounded-xl bg-marfil/60 p-4 ring-1 ring-carbon/5">
        {/* Título del podio */}
        <div className="mx-auto mb-4 h-3 w-36 animate-pulse rounded bg-carbon/10" />

        <div className="grid grid-cols-3 items-end gap-3">
          {/* 2.º — barra mediana */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9 animate-pulse rounded-full bg-carbon/10" />
            <div className="h-3 w-12 animate-pulse rounded bg-carbon/10" />
            <div className="h-3 w-10 animate-pulse rounded bg-carbon/10" />
            <div className="mt-2 h-16 w-full animate-pulse rounded-t-lg bg-carbon/10" />
          </div>

          {/* 1.º — barra más alta */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 animate-pulse rounded-full bg-carbon/10" />
            <div className="h-3 w-14 animate-pulse rounded bg-carbon/10" />
            <div className="h-3 w-10 animate-pulse rounded bg-carbon/10" />
            <div className="mt-2 h-24 w-full animate-pulse rounded-t-lg bg-carbon/10" />
          </div>

          {/* 3.º — barra más corta */}
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 w-8 animate-pulse rounded-full bg-carbon/10" />
            <div className="h-3 w-12 animate-pulse rounded bg-carbon/10" />
            <div className="h-3 w-10 animate-pulse rounded bg-carbon/10" />
            <div className="mt-2 h-12 w-full animate-pulse rounded-t-lg bg-carbon/10" />
          </div>
        </div>
      </div>

      {/* Tabla fantasma */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {/* Thead */}
        <div className="flex items-center gap-3 bg-carbon px-3 py-2">
          <div className="h-3 w-4 rounded bg-white/20" />
          <div className="h-3 flex-1 rounded bg-white/20" />
          <div className="h-3 w-8 rounded bg-white/20" />
          <div className="h-3 w-6 rounded bg-white/20" />
          <div className="h-3 w-6 rounded bg-white/20" />
        </div>

        {/* 5 filas */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-t border-carbon/5 px-3 py-2.5">
            <div className="h-3 w-4 animate-pulse rounded bg-carbon/10" />
            <div className="flex flex-1 items-center gap-2">
              <div className="h-7 w-7 animate-pulse rounded-full bg-carbon/10" />
              <div className="h-3 w-24 animate-pulse rounded bg-carbon/10" />
            </div>
            <div className="h-4 w-8 animate-pulse rounded bg-carbon/10" />
            <div className="h-3 w-6 animate-pulse rounded bg-carbon/10" />
            <div className="h-3 w-6 animate-pulse rounded bg-carbon/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
