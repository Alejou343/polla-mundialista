"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-12 text-center">
      <p className="text-cancha">Error: {error.message}</p>
      <button onClick={reset} className="btn-primary mt-4">
        Reintentar
      </button>
    </main>
  );
}
