// Skeleton del panel admin — code card + 3 admin-match-rows fantasma
export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-sm space-y-6 px-4 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-carbon/10" />
        <div className="h-10 w-56 animate-pulse rounded bg-carbon/10" />
      </div>

      {/* Code card fantasma */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="h-3 w-28 animate-pulse rounded bg-carbon/10" />
        <div className="mt-1 h-3 w-64 animate-pulse rounded bg-carbon/10" />
        <div className="mt-3 flex items-center gap-2 rounded-md bg-marfil p-2">
          <div className="h-6 flex-1 animate-pulse rounded bg-carbon/10" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-carbon/10" />
        </div>
      </div>

      {/* Sección "Editar resultados" */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-carbon/10" />
          <div className="h-3 w-16 animate-pulse rounded bg-carbon/10" />
        </div>
        <div className="mb-3 h-3 w-72 animate-pulse rounded bg-carbon/10" />

        {/* 3 AdminMatchRow fantasma */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-3 shadow-sm">
              {/* Header fila: etapa + hora */}
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 animate-pulse rounded bg-carbon/10" />
                <div className="h-3 w-20 animate-pulse rounded bg-carbon/10" />
              </div>

              {/* Grid de equipos + inputs */}
              <div className="mt-2 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2">
                {/* Equipo local: bandera + nombre */}
                <div className="flex items-center justify-end gap-1.5">
                  <div className="h-3 w-14 animate-pulse rounded bg-carbon/10" />
                  <div className="h-[18px] w-6 animate-pulse rounded-sm bg-carbon/10" />
                </div>
                {/* Input local */}
                <div className="h-10 w-full animate-pulse rounded-md bg-carbon/10" />
                {/* Guión */}
                <div className="h-3 w-2 animate-pulse rounded bg-carbon/10" />
                {/* Input visitante */}
                <div className="h-10 w-full animate-pulse rounded-md bg-carbon/10" />
                {/* Equipo visitante: bandera + nombre */}
                <div className="flex items-center gap-1.5">
                  <div className="h-[18px] w-6 animate-pulse rounded-sm bg-carbon/10" />
                  <div className="h-3 w-14 animate-pulse rounded bg-carbon/10" />
                </div>
              </div>

              {/* Footer fila: mensaje + botón */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="h-3 w-28 animate-pulse rounded bg-carbon/10" />
                <div className="h-8 w-36 animate-pulse rounded-md bg-carbon/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
